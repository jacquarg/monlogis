'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Model = require('../models/consumptionstatement')

module.exports = CozyCollection.extend({
  model: Model,
  sort: 'end',

  getFetchIndex: function () { return ['_id', 'statementCategory'] },
  getFetchQuery: function () {
    return { selector: {
      _id: { $gte: null },
      statementCategory: { $ne: 'edelia' } }
    }
  },


  getLastPeriod: function () {
    if (this.length >= 1) {
      return this.last()
    }
  },

  getPenultimatePeriod: function () {
    if (this.length >= 2) {
      return this.at(this.length - 2)
    }
  },
})
