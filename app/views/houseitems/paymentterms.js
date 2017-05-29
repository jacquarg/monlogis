'use strict';

const template = require('../templates/houseitems/paymentterms');
const Paymentterms = require('../../models/paymentterms');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function (options) {
    this.model = new Paymentterms();
    if (options.vendor === 'EDF') {
      this.model.fetchEDF();
    } else if (options.vendor === 'Maif') {
      this.model.fetchMaif();
      this.contract = options.contract;
    }
  },

  serializeData: function () {
    let vendor = this.model.get('vendor');
    vendor = vendor ? vendor.toLowerCase() : '';

    const data = this.model.toJSON();
    if (vendor === 'edf') {
      data.nextPaymentAmount = this.model.getNextPaymentEDF();
      data.lastPaymentAmount = this.model.getLastPaymentEDF();
    }

    if (vendor === 'maif') {
      data.annualCost = this.contract.get('montantTarifTtc');
      // data.nextPaymentAmount = this.contract.get('montantTarifTtc');
    }
    return data;
  },

});
