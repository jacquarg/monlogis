'use strict';

const template = require('../templates/houseitems/consomation_edf');
const Consomation = require('../../models/consomation');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Consomation();
    this.model.fetch();
  },

});
