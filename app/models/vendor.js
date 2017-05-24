'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

const FilesCollection = require('../collections/files');

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.vendor',

  createDir: function () {
    if (this.dirID) { return Promise.resolve(); }

    return cozy.client.files.createDirectoryByPath(this.getFolderPath())
    .then((dir) => {
      this.dirID = dir._id;
    });
  },

  getDirID: function () {
    return this.dirID;
  },

  getFolderPath: function () {
    return this.get('folderPath');
  },

  getFiles: function () {
    if (!this.files) {
      this.files = new FilesCollection({ folderPath: this.getFolderPath() });
    }

    return this.files;
  },


});
