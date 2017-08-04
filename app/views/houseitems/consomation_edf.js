'use strict'

const template = require('../templates/houseitems/consomation_edf')
const ConsumptionStatements = require('../../collections/consumptionstatements')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  // modelEvents: {
  //   change: 'render',
  // },

  //   change: 'render',
  // },
  initialize: function () {
    this.collection = new ConsumptionStatements()
    this.listenTo(this.collection, 'add', this.render)
    this.collection.fetch()
  },

  serializeData: function () {
    const lastPeriod = this.collection.getLastPeriod()
    const penultimatePeriod = this.collection.getPenultimatePeriod()
    const data = {}
    if (lastPeriod) {
      data.lastPeriod = lastPeriod.toJSON()
      data.lastPeriod.duration = lastPeriod.getPeriodDuration()
    }
    if (penultimatePeriod) {
      data.penultimatePeriod = penultimatePeriod.toJSON()
      data.penultimatePeriod.duration = penultimatePeriod.getPeriodDuration()
      const increase = lastPeriod.get('value') - penultimatePeriod.get('value')
      if (increase < 0) {
        data.increase = increase / lastPeriod.get('value')
      }
    }
    return data
  },

})
