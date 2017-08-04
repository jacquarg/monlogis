'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const AnObject = require('models/object')

module.exports = CozyCollection.extend({
  model: AnObject,

  initialize: function () {
    // this.addDummyItem()
    // this.listenTo(this, 'all', this.addDummyItem)
  },

  getDummyItemAttrs: () => ({
    name: 'Mon objet',
    slug: 'newOjbect',
    type: 'object',
    folderPath: '',
  }),

  addDummyItem: function () {
    if (this.some(el => el.isNew())) { return }

    this.add(new AnObject(this.getDummyItemAttrs()))
  },

  getFetchIndex: () => ['type'],
  getFetchQuery: () => ({ selector: { type: { $gt: 'equipment' } } }),
})
