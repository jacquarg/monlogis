'use strict';

const template = require('../templates/houseitems/societaire_maif');
const SocietaireMaif = require('../../models/client');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new SocietaireMaif();
    this.model.fetchMaif();
  },

  // onRender: function () {
  //
  // },


});
