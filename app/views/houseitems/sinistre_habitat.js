'use strict';

const template = require('../templates/houseitems/sinistre_habitat');
const SinistreMaif = require('../../models/sinistre');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new SinistreMaif();
    this.model.fetch();
  },

  // onRender: function () {
  //
  // },


});
