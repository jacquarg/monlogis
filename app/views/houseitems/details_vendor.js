'use strict';

const template = require('../templates/houseitems/details_vendor');
const BillsView = require('./bills');
const BillsCollection = require('collections/bills');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  regions: {
    bills: '.bills',
  },

  initialize: function () {
    this.collection = new BillsCollection({ vendor: this.model.get('slug') });
    this.collection.fetch();
  },

  onRender: function () {
    this.showChildView('bills', new BillsView({
      model: this.model,
      collection: this.collection,
    }));
  },

});
