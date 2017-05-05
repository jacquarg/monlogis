'use strict';

const VendorItemView = require('./vendor_item');
const template = require('../templates/houseitems/vendors');

const VendorsCollection = require('collections/vendors');

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
    this.collection = new VendorsCollection([
      {
        name: 'EDF',
        slug: 'edf',
        doamin: 'energy',
        konnectorAccount: null,
        folderPath: 'administration/EDF/',
      },
      {
        name: 'Maif',
        slug: 'maif',
        domain: 'insurance',
        konnectorAccount: null,
        folderPath: 'administration/Maif/',
      },
    ]);
  },

  onRender: function () {
    this.showChildView('collection', new VendorsView({ collection: this.collection }));
  },
});
