'use-strict';

const template = require('../templates/houseitems/upload_file');
const get = require('../../lib/walktree_utils').get;

module.exports = Mn.View.extend({
  template: template,

  ui: {
    inputFile: 'input[type="file"]',
    inputFileName: 'input[name="filename"]',
  },

  events: {
    'change @ui.inputFile': 'setDefaultName',
    'click button[name="addfile"]': 'uploadFile',
  },

  initialize: function () {
    // this.insights ...
  },

  setDefaultName: function () {
    if (!this.ui.inputFileName.val()) {
      const name = get(this.ui.inputFile, 0, 'files', 0, 'name');
      this.ui.inputFileName.val(name);
    }
  },

  uploadFile: function () {
    const file = get(this.ui.inputFile, 0, 'files', 0);
    const name = this.ui.inputFileName.val();

    if (file && name !== null) {
      app.trigger('message:display', 'Création du répertoire en cours ...', 'upload_file');
      this.model.createDir()
      .then(() => app.trigger('message:display', 'Téléversement du fichier en cours ...', 'upload_file'))
      .then(() => cozy.client.files.create(file, { name: name, dirID: this.model.get('dirID') }))
      .then((file) => {
        app.trigger('message:hide', 'upload_file');
        this.model.trigger('newFile', file);
      })
      .catch((err) => {
        app.trigger('message:hide', 'upload_file');
        app.trigger('message:error', 'Erreur lors du téléversement du fichier.');
        console.error(err);
      });
    } else {
      app.trigger('message:error', 'Fichier invalide, ou nom incomplet.');
    }
  },
});
