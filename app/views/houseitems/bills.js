'use strict';

const BillItemView = require('./bill_item');
const template = require('../templates/houseitems/bills');

const BillsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: BillItemView,
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
    this.showChildView('collection', new BillsView({ collection: this.collection }));
  },

});
