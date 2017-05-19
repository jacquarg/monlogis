'use strict';

const template = require('../templates/houseitems/foyer_maif');
const FoyerMaif = require('../../models/foyer');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new FoyerMaif();
    this.model.fetch();
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.foyerMaif = this.model.getFoyerMaif();
    return data;
  },

});
