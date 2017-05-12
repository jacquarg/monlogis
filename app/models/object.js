'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

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

});
