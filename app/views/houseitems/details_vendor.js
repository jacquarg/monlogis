'use strict';

const template = require('../templates/houseitems/details_vendor');
const BillsView = require('./bills');
const FilesView = require('./files');
const BillsCollection = require('collections/bills');
const FilesCollection = require('collections/files');

module.exports = Mn.View.extend({
  template: template,
  className: 'row',


  events: {
  },

  triggers: {
    'click .close': 'close',
  },

  modelEvents: {
    change: 'render',
  },

  regions: {
    bills: '.bills',
    files: '.files',
  },

  initialize: function () {
    this.bills = new BillsCollection({ vendor: this.model.get('slug') });
    this.bills.fetch();

    this.files = new FilesCollection({ folderPath: this.model.get('folderPath') });
    this.files.fetch();
  },

  onRender: function () {
    this.showChildView('bills', new BillsView({
      model: this.model,
      collection: this.bills,
    }));

    this.showChildView('files', new FilesView({
      model: this.model,
      collection: this.files,
    }));
  },

  onClose: function () {
    app.trigger('houseitemdetails:close');
  },

});
