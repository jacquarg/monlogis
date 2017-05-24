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
    const data = this.model.toJSON();
    if (this.model.get('vendor') === 'EDF') {
      data.nextPaymentAmount = this.model.getNextPaymentEDF();
      data.lastPaymentAmount = this.model.getLastPaymentEDF();
    }

    if (this.model.get('vendor') === 'maif') {
      // data.annualCost = this.contract.get('montantTarifTtc');
      // data.nextPaymentAmount = this.contract.get('montantTarifTtc');
    }
    return data;
  },

});
