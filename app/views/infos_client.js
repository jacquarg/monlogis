'use strict';

const template = require('./templates/infos_client');
const Client = require('../models/client');

module.exports = Mn.View.extend({
  template: template,

  events:  {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Client();
    this.model.fetch();
  },

  // onRender: function () {

  // },


});
