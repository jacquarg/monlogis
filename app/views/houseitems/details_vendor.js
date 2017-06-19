'use strict';

const template = require('../templates/houseitems/details_vendor');
const FilesView = require('./files');
const BudgetView = require('./budget');

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
    files: '.files',
    budget: '.budget',
  },

  initialize: function () {
    this.model.fetchAll();
  },

  onRender: function () {
    this.showChildView('files', new FilesView({ model: this.model }));
    this.showChildView('budget', new BudgetView({ model: this.model }));
  },
});
