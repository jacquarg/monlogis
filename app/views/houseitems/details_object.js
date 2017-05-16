'use strict';

const template = require('../templates/houseitems/details_object');
const FilesView = require('./files');
const FilesCollection = require('collections/files');
const UploadFile = require('./upload_file');

module.exports = Mn.View.extend({
  template: template,

  ui: {
    icon: 'img.objecticon',
    changeIcon: 'input#changeicon',
    inputName: 'input[name="name"]',
    inputDescription: 'textarea[name="description"]',
  },

  events: {
    'change @ui.inputName': 'onFormChange', // TODO : update FolderPath on name change.
    'change @ui.inputDescription': 'onFormChange',
    'click @ui.changeIcon': 'changeIcon',
  },

  modelEvents: {
    change: 'render',
    newFile: 'updateFilesCollection',
  },

  regions: {
    files: '.files',
    addFile: '.addfile',
  },

  initialize: function () {
    this.files = new FilesCollection({ folderPath: this.model.getFolderPath() });
    this.files.fetch();

    console.log(this.files);
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

  updateFilesCollection: function (file) {
    this.files.add(file);
  },

  displayIcon: function (iconFile) {
    iconFile.getFileUrl().then((url) => {
      this.iconUrl = url;
      this.ui.objecticon.attr('src', url);
    });
  },

  changeIcon: function () {
    //eslint-disable-next-line
    const imgFiles = this.files.filter(file => file.has('attributes') && file.get('attributes')['class'] === 'image');

    let iconFile = imgFiles.get(this.model.get('iconFileId'));
    let index = imgFiles.indexOf(iconFile);
    index = (index + 1) % imgFiles.size();

    iconFile = imgFiles.at(index);

    this.model.save('iconFileId', iconFile.get('_id'));

    displayIcon();
  },
});
