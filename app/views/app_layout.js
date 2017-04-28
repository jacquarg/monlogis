'use-strict';

const MessageView = require('views/message');
const template = require('views/templates/app_layout');

module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',

  behaviors: {},

  regions: {
    message: '.message',
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
  },
});
