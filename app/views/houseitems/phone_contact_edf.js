'use strict';

const template = require('../templates/houseitems/phone_contact_edf');
const PhoneContact = require('../../models/client');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new PhoneContact();
    this.model.fetch();
  },

  // onRender: function () {

  // },


});
