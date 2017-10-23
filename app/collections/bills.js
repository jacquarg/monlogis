'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Bill = require('models/bill')

module.exports = CozyCollection.extend({
  model: Bill,

  sort: 'date',
  initialize: function (options) {
    this.vendor = options.vendor
  },

  getFetchIndex: function () { return ['vendor', 'date'] },
  getFetchQuery: function () {
    // TODO : howto automatic link to wikiapi ?
    const vendorMap = {
      sfrmobile: 'SFR MOBILE',
      sfrbox: 'SFR BOX',
    }
    const vendor = vendorMap[this.vendor] || this.vendor

    return { selector: { vendor: vendor } }
  },
})
