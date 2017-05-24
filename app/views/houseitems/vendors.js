'use strict';

const VendorItemView = require('./vendor_item');
const template = require('../templates/houseitems/vendors');

const VendorsView = Mn.CollectionView.extend({
  tagName: 'ul',
  className: 'movielibrary',
  childView: VendorItemView,
});

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
    this.showChildView('collection', new VendorsView({ collection: this.collection }));
  },
});
