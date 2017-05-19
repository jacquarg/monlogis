'use strict';

const template = require('../templates/houseitems/details_maif');
const ContractMaif = require('../../models/contract');
// const SinstreHabitatView = require('./sinistre_habitat');
const PaymenttermsView = require('./paymentterms');
const SocietaireView = require('./societaire_maif');
const FoyerView = require('./foyer_maif');
const HomeView = require('./home_maif');
const SinistreView = require('./sinistre');
const SinistreCollection = require('collections/sinistre');


module.exports = Mn.View.extend({
  template: template,

  regions: {
    // sinistreHabitat: '.sinistreHabitat',
    sinistres: '.sinistres',
    homeMaif: '.homeMaif',
    foyerMaif: '.foyerMaif',
    societaireMaif: '.societaireMaif',
    paymentterms: '.paymentterms',
  },

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new ContractMaif();
    this.model.fetchMaif();
    this.sinistres = new SinistreCollection({ vendor: 'Maif' });
    this.sinistres.fetch();
  },

  onRender: function () {
    // this.showChildView('sinistreHabitat', new SinstreHabitatView());
    this.showChildView('sinistres', new SinistreView({
      model: new Backbone.Model({ slug: 'Maif' }),
      collection: this.sinistres,
    }));
    this.showChildView('homeMaif', new HomeView());
    this.showChildView('foyerMaif', new FoyerView());
    this.showChildView('societaireMaif', new SocietaireView());
    this.showChildView('paymentterms', new PaymenttermsView({ vendor: 'Maif', contract: this.model }));
  },

});
