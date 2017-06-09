'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');
const FileModel = require('./file');
const FilesCollection = require('collections/files');

const BASE_DIR = '/Administration/objets/';

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.object',

  defaults: $.extend(CozyModel.defaults, {
    type: 'object',
  }),

  getFolderPath: function () {
    return `${BASE_DIR}${this.get('name')}`;
  },

  createDir: function () {
    if (this.has('dirID')) {
      return Promise.resolve();
    }

    return cozy.client.files.createDirectoryByPath(this.getFolderPath())
    .then(dir => this.set('dirID', dir._id));
  },

  getFiles: function () {
    if (!this.files) {
      this.files = new FilesCollection({ folderPath: this.getFolderPath() });
    }
    return this.files;
  },

  setIconFileId: function (iconFileId) {
    this.set('iconFileId', iconFileId);
    this.iconFile = null;
    this.iconUrl = null;
  },

  getIconUrl: function () {
    if (this.iconUrl) {
      return this.iconUrl;
    }

    this._fetchIcon()
    .catch((err) => {
      console.error(err);

      this.unset('iconFileId');
    });
  },

  _fetchIcon: function () {
    const iconId = this.get('iconFileId');

    if (!iconId) { return Promise.reject(); }

    this.iconFile = new FileModel({ _id: iconId });
    return this.iconFile.fetch()
    .then(() => this.iconFile.getFileUrl())
    .then((fileUrl) => {
      this.iconUrl = fileUrl;
      this.trigger('newIconUrl');
    });
  },
});
