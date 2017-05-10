'use-strict';

const File = require('models/file');

module.exports = Backbone.Collection.extend({
  model: File,

  initialize: function (options) {
    this.folderPath = options.folderPath;
  },

  sync: function (method, collection, options) {
    if (method !== 'read') {
      console.error('Only read is available on this collection.');
      if (options.error) {
        options.error('Only read is available on this collection.');
      }
      return;
    }

    cozy.client.files.statByPath(this.folderPath)
    .then(dir => dir.relations('contents').map((file) => {
      const data = file.attributes;
      data.toto = 'truc';
      data._id = file._id;
      return data;
    }))
    .then(options.success, options.error);
  },
});
