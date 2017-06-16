'use-strict';

const VendorModel = require('./vendor_base');

const Contract = require('./contract');

module.exports = VendorModel.extend({

  fetchAll: function () {
    return Promise.all([
      this.getFiles().fetch(),
      this.getContract().fetch(),
      // this.getPaymentterms
    ]);
  },

  getContract: function () {
    if (!this.contract) {
      this.contract = new ContractMaif();
    }
    return this.contract;

  },

  _computeBudget: function () {
    const yearly = this.contract.get('montantTarifTtc'); //TODO !!
    return {
      mensual: yearly / 12,
      daily: yearly / 12 / 30,
      annual: yearly,
    };
  },

});
