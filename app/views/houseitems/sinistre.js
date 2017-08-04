'use strict'

const SinistreItemView = require('./sinistre_item')
const template = require('../templates/houseitems/sinistre')

const SinistreView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: SinistreItemView,
})

module.exports = Mn.View.extend({
  // className: 'mymovies',
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('collection', new SinistreView({ collection: this.collection }))
  },

})
