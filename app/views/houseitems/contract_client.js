'use strict';

const template = require('../templates/houseitems/contract_client');
const Contract = require('../../models/contract');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Contract();
    this.model.fetch();
  },

  // onRender: function () {
  //
  // },


});
