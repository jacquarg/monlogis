'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'io.cozy.files',

  getFileUrl: function () {
    return cozy.client.files.getDownloadLinkById(this.get('_id'))
    .then(absolutePath => `//${app.cozyDomain}${absolutePath}`);
  },

});
