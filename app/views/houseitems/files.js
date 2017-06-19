'use strict';

const UploadFile = require('./upload_file');

const FileItemView = require('./file_item');
const template = require('../templates/houseitems/files');

const FilesView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: FileItemView,
});

module.exports = Mn.View.extend({
  // className: 'row',
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
    addFile: '.addfile',
  },

  modelEvents: {
    newFile: 'updateFilesCollection',
  },

  initialize: function () {
    this.collection = this.model.getFiles();
    this.model.injectBillsInFiles();
  },

  updateFilesCollection: function (file) {
    this.collection.add(file);
  },

  serializeData: function () {
    const data = this.model.toJSON();
    const driveAppURI = $("#coz-bar a[href*='drive.']").attr('href');
    data.folderInFilesURI = `${driveAppURI}#/files/${this.model.getDirID()}`;

    return data;
  },

  onRender: function () {
    this.showChildView('collection', new FilesView({ collection: this.collection }));
    this.showChildView('addFile', new UploadFile({ model: this.model }));
  },

});
