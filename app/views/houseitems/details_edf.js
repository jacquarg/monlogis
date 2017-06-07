'use strict';

const BaseDetailsView = require('./details_base');
const template = require('../templates/houseitems/details_edf');
// TODO : move to contract edf ; move into this view ?
const ContractView = require('./contract_client');
const ConsomationView = require('./consomation_edf');
const PhoneDepannageView = require('./phone_depannage_edf');
const PhoneContactView = require('./phone_contact_edf');
const PaymenttermsView = require('./paymentterms');
const BillsView = require('./bills');
const BillsCollection = require('collections/bills');

const FilesView = require('./files');


module.exports = BaseDetailsView.extend({
  template: template,

  regions: {
    bills: '.bills',
    contract: '.contract',
    consomation: '.consumption',
    phoneDepannage: '.phoneTroubleshooting',
    phoneContact: '.phoneContact',
    paymentterms: '.paymentterms',
    files: '.files',
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
    this.model.getFiles().fetch();

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
    this.showChildView('files', new FilesView({ model: this.model, }));
  },


  onClose: function () {
    app.trigger('houseitemdetails:close');
  },

});
