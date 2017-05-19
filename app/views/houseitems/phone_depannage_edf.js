'use strict';

const template = require('../templates/houseitems/phone_depannage_edf');
const PhoneDeppanage = require('../../models/contract');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new PhoneDeppanage();
    this.model.fetchEDF();
  },

});
