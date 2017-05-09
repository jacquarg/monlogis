'use strict';

const template = require('../templates/houseitems/facture_edf');
const Facture = require('../../models/facture');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Facture();
    this.model.fetch();
  },

  // onRender: function () {
  //
  // },


});
