'use-strict';

const template = require('../templates/houseitems/file_item');
const mimetype2FA = require('lib/mimetype2fa')({ prefix: 'fa-' });

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  events: {
    click: 'openFile',
  },

  modelEvents: {
    change: 'render',
  },

  serializeData: function () {
    const data = this.model.toJSON();
    if (this.model.bill) {
      data.bill = this.model.bill.toJSON();
      data.bill.date = data.bill.date.slice(0, 10);
    }
    if (data.attributes && data.attributes.mime) {
      data.faClass = mimetype2FA(data.attributes.mime);
    }
    console.log(data);
    return data;
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
