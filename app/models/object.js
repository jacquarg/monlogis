'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');
const FileModel = require('./file');

const BASE_DIR = '/Administration/objets/';

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.object',

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

  setIconFileId: function (iconFileId) {
    this.set('iconFileId', iconFileId);
    this.iconFile = null;
    this.iconUrl = null;
  },

  getIconUrl: function () {
    if (this.iconUrl) {
      return this.iconUrl;
    }

    const defaultUrl = '/assets/img/gift_icon.png';

    this._fetchIcon()
    .catch((err) => {
      console.error(err);

      this.unset('iconFileId');
    });

    return defaultUrl;
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
