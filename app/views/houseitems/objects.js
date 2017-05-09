'use strict';

const ObjectItemView = require('./object_item');
const template = require('../templates/houseitems/objects');

const ObjectsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: ObjectItemView,
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

  initialize: function () {},

  onRender: function () {
    this.showChildView('collection', new ObjectsView({ collection: this.collection }));
  },
});
