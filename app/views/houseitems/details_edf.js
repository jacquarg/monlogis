'use strict';

const template = require('../templates/houseitems/details_edf');
const Paiment = require('../../models/paiment');
const BillsView = require('./bills');
const BillsCollection = require('collections/bills');

module.exports = Mn.View.extend({
  template: template,

  regions: {
    bills: '.bills',
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
    return data;
  },
  // .holder= dernierReglement.type

  onRender: function () {
    this.showChildView('bills', new BillsView({
      model: new Backbone.Model({ slug: 'EDF' }),
      collection: this.bills,
    }));
  },
});
