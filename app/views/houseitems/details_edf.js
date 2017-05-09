'use strict';

const template = require('../templates/houseitems/details_edf');
const Paiment = require('../../models/paiment');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Paiment();
    this.model.fetch();
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.nextPaymentAmount = this.model.getNextPaymentEDF();
    return data;
  },
  //.holder= dernierReglement.type

  // onRender: function () {

  // },
});
