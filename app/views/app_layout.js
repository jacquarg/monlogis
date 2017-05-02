'use-strict';

const template = require('views/templates/app_layout');
const MessageView = require('views/message');
const InfosClientView = require('views/infos_client');

module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',

  behaviors: {},

  regions: {
    message: '.message',
    infosClient: '.client',
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('infosClient', new InfosClientView());
  },
});
