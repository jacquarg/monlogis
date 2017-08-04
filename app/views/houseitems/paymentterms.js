'use strict'

const template = require('../templates/houseitems/paymentterms')
const Paymentterms = require('../../models/paymentterms')
const PaymenttermsMaif = require('../../models/paymentterms_maif')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function (options) {
    this.vendor = options.vendor
    if (this.vendor === 'edf') {
      this.model = new Paymentterms()
      this.model.fetchEDF()
    } else if (this.vendor === 'maif') {
      this.model = new PaymenttermsMaif()
      this.model.fetch()
      this.contract = options.contract
    }
  },

  serializeData: function () {
    const data = this.model.toJSON()
    if (this.vendor === 'edf') {
      data.nextPaymentAmount = this.model.getNextPaymentEDF()
      data.lastPaymentAmount = this.model.getLastPaymentEDF()
    }

    if (this.vendor === 'maif') {
      data.annualCost = this.contract.get('montantTarifTtc')
    }
    return data
  },

})
