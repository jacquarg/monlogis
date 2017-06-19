'use-strict';

const VendorModel = require('./vendor_base');
const Client = require('./client');
const Contract = require('./contract');


module.exports = VendorModel.extend({

  toFetch: function () {
    return [
      this.getFiles().fetch(),
      this.getBills().fetch(),
      this.fetchClient(),
      this.fetchContract(),
    ];
  },


  fetchClient: function () {
    this.client = new Client();
    return this.client.fetchEDF();
  },

  fetchContract: function () {
    this.contract = new Contract();
    return this.contract.fetchEDF();
  },

  _getBillsVendor: () => 'EDF',

  _computeBudget: function () {
    const bill = this.getBills().last();
    const yearly = Number(bill.get('totalPaymentDue'));
    return {
      mensual: yearly / 12,
      daily: yearly / 12 / 30,
      annual: yearly,
    };
  },
});
