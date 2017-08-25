'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Sinistre = require('models/sinistre')

module.exports = CozyCollection.extend({
  model: Sinistre,

  initialize: function (options) {
    this.type = options.type
  },

  getFetchIndex: function () { return ['type'] },
  getFetchQuery: function () {
    return { selector: { type: 'Habitation' } }
  },

})
