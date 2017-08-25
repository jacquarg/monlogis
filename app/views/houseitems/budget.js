'use strict'

const template = require('../templates/houseitems/budget')

module.exports = Mn.View.extend({
  template: template,

  serializeData: function () {
    const data = this.model.getBudget()
    data.annualMetaphore = Math.round(data.annual / 100) // dîner gastronomique
    data.mensualMetaphore = Math.round(data.mensual / 10) // places de cinéma
    data.dailyMetaphore = Math.round(data.daily / 0.90) // croissant
    return data
  },

})
