'use strict';

const template = require('../templates/houseitems/details_edf');
const Client = require('../../models/client');

module.exports = Mn.View.extend({
  template: template,

  events: {
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
