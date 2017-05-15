'use-strict';

const template = require('../templates/houseitems/file_item');

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  events: {
    click: 'openFile',
  },

  modelEvents: {
    change: 'render',
  },

  openFile: function () {
    this.model.getFileUrl()
    .then((url) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = this.model.get('name');
      document.body.appendChild(link);
      link.click();
    });
  },

});
