'use strict';

const template = require('../templates/houseitems/details_edf');
const Paiment = require('../../models/paiment');
const ContractView = require('./contract_client');
const ConsomationView = require('./consomation_edf');
const PhoneDepannageView = require('./phone_depannage_edf');
const PhoneContactView = require('./phone_contact_edf');
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
  },

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Paiment();
    this.model.fetch();
    this.bills = new BillsCollection({ vendor: 'EDF' });
    this.bills.fetch();
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.nextPaymentAmount = this.model.getNextPaymentEDF();
    data.lastPaymentAmount = this.model.getLastPaymentEDF();
    return data;
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
  },
});
