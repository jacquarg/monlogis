'use strict';

const template = require('../templates/houseitems/details_vendor');
// const BillsView = require('./bills');
const FilesView = require('./files');
const BudgetView = require('./budget');
// const BillsCollection = require('collections/bills');
const FilesCollection = require('collections/files');

module.exports = Mn.View.extend({
  template: template,
  className: 'row',

  triggers: {
    'click .close': 'close',
  },

  modelEvents: {
    fetchedall: 'render',
  },

  regions: {
    // bills: '.bills',
    files: '.files',
    budget: '.budget',
  },

  initialize: function () {
    this.model.fetchAll();
  },

  onRender: function () {
    // this.showChildView('bills', new BillsView({
    //   model: this.model,
    //   collection: this.bills,
    // }));

    this.showChildView('files', new FilesView({ model: this.model }));
    this.showChildView('budget', new BudgetView({ model: this.model }));
  },

  onClose: function () {
    app.trigger('houseitemdetails:close');
  },

});
