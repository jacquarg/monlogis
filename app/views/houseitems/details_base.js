'use strict';

// const FilesView = require('./files');

module.exports = Mn.View.extend({
  className: 'row',
  /*
  ui: {
    icon: 'img.objecticon',
    changeIcon: 'button#changeicon',
    inputName: 'input[name="name"]',
    inputDescription: 'textarea[name="description"]',
  },

  events: {
    'change @ui.inputName': 'onFormChange', // TODO : update FolderPath on name change.
    'change @ui.inputDescription': 'onFormChange',
    'click @ui.changeIcon': 'changeIcon',
  },

  triggers: {
    'click .close': 'close',
  },

  modelEvents: {
    change: 'render',
    newIconUrl: 'render',

  },

  regions: {
    files: '.files',

  },

  initialize: function () {
    this.model.getFiles().fetch();
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.iconUrl = this.model.getIconUrl();
    return data;
  },

  onRender: function () {
    this.showChildView('files', new FilesView({ model: this.model, }));
  },

  onFormChange: function () {
    this.model.save({
      name: this.ui.inputName.val(),
      description: this.ui.inputDescription.val(),
    });
  },

  onClose: function () {
    app.trigger('houseitemdetails:close');
  },

  // displayIcon: function (iconFile) {
  //   iconFile.getFileUrl().then((url) => {
  //     this.iconUrl = url;
  //     this.ui.icon.attr('src', url);
  //   });
  // },

  changeIcon: function () {
    const files = this.model.getFiltes();
    //eslint-disable-next-line
    const imgFiles = files.filter(file => file.has('attributes') && file.get('attributes')['class'] === 'image');

    if (imgFiles.length === 0) { return; }

    const iconFileId = this.model.get('iconFileId');
    let iconFile = null;
    let index = 0;
    if (iconFileId) {
      iconFile = files.get(iconFileId);
      index = imgFiles.indexOf(iconFile);
      index = (index + 1) % imgFiles.length;
    }

    iconFile = imgFiles[index];

    this.model.setIconFileId(iconFile.get('_id'));
    this.model.save();
  },
*/
});
