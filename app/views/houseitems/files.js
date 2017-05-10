'use strict';

const FileItemView = require('./file_item');
const template = require('../templates/houseitems/files');

const FilesView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: FileItemView,
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
    this.showChildView('collection', new FilesView({ collection: this.collection }));
  },
});
