'use-strict';

const VendorModel = require('./vendor_base');

module.exports = VendorModel.extend({
  fetchAll: function () {
    return Promise.all([
      this.getFiles().fetch(),
      this.getBills().fetch(),
      // this.getPaymentterms
    ]);
  },


  _getBillsVendor: () => 'EDF',

  _computeBudget: function () {
    const bill = this.getBills().last();
    const yearly = bill.get('totalPaymentDue');
    return {
      mensual: yearly / 12,
      daily: yearly / 12 / 30,
      annual: yearly,
    };
  },
});
