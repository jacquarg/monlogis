'use strict';

const template = require('../templates/houseitems/details_edf');
const ContractView = require('./contract_client');
const ConsomationView = require('./consomation_edf');
const PhoneDepannageView = require('./phone_depannage_edf');
const PhoneContactView = require('./phone_contact_edf');
const PaymenttermsView = require('./paymentterms');
const BillsView = require('./bills');
const BillsCollection = require('collections/bills');

module.exports = Mn.View.extend({
  template: template,

  regions: {
    bills: '.bills',
    contract: '.contract',
    consomation: '.consomation',
    phoneDepannage: '.phoneDepannage',
    phoneContact: '.phoneContact',
    paymentterms: '.paymentterms',
  },

  events: {
  },

  triggers: {
    'click .close': 'close',
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.bills = new BillsCollection({ vendor: 'EDF' });
    this.bills.fetch();
  },

  // .holder= dernierReglement.type

  onRender: function () {
    this.showChildView('bills', new BillsView({
      model: new Backbone.Model({ slug: 'EDF' }),
      collection: this.bills,
    }));
    this.showChildView('contract', new ContractView());
    this.showChildView('consomation', new ConsomationView());
    this.showChildView('phoneDepannage', new PhoneDepannageView());
    this.showChildView('phoneContact', new PhoneContactView());
    this.showChildView('paymentterms', new PaymenttermsView({ vendor: 'EDF' }));
  },


  onClose: function () {
    app.trigger('houseitemdetails:close');
  },

});
