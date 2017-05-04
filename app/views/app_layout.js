'use-strict';

const template = require('views/templates/app_layout');
const MessageView = require('views/message');

const HouseitemDetailsEDFView = require('views/houseitems/details_edf');

module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',

  behaviors: {},

  regions: {
    message: '.message',
    houseitemDetails: '.houseitemdetails',
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('houseitemDetails', new HouseitemDetailsEDFView());
  },
});
