'use strict';

const template = require('../templates/houseitems/details_object');
const FilesView = require('./files');
const FilesCollection = require('collections/files');
const UploadFile = require('./upload_file');

module.exports = Mn.View.extend({
  template: template,

  ui: {
    inputName: 'input[name="name"]',
    inputDescription: 'textarea[name="description"]',
  },

  events: {
    'change @ui.inputName': 'onFormChange', // TODO : update FolderPath on name change.
    'change @ui.inputDescription': 'onFormChange',
  },

  modelEvents: {
    change: 'render',
  },

  regions: {
    files: '.files',
    addFile: '.addfile',
  },

  initialize: function () {
    this.files = new FilesCollection({ folderPath: this.model.getFolderPath() });
    this.files.fetch();
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.iconUrl = '/assets/img/gift_icon.png';
    return data;
  },

  onRender: function () {
    this.showChildView('files', new FilesView({
      model: this.model,
      collection: this.files,
    }));
    this.showChildView('addFile', new UploadFile({ model: this.model }));
  },

  onFormChange: function () {
    this.model.save({
      name: this.ui.inputName.val(),
      description: this.ui.inputDescription.val(),
    });
  },

});
