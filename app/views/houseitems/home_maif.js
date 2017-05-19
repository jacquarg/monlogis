'use strict';

const template = require('../templates/houseitems/home_maif');
const HomeMaif = require('../../models/home');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new HomeMaif();
    this.model.fetch();
  },

});
