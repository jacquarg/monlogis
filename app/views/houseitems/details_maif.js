'use strict';

const template = require('../templates/houseitems/details_maif');
const ContractMaif = require('../../models/contract');
const SinstreHabitatView = require('./sinistre_habitat');
const SocietaireView = require('./societaire_maif');
const FoyerView = require('./foyer_maif');
const HomeView = require('./home_maif');

module.exports = Mn.View.extend({
  template: template,

  regions: {
    sinistreHabitat: '.sinistreHabitat',
    homeMaif: '.homeMaif',
    foyerMaif: '.foyerMaif',
    societaireMaif: '.societaireMaif',
  },

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new ContractMaif();
    this.model.fetchMaif();
  },

  onRender: function () {
    this.showChildView('sinistreHabitat', new SinstreHabitatView());
    this.showChildView('homeMaif', new HomeView());
    this.showChildView('foyerMaif', new FoyerView());
    this.showChildView('societaireMaif', new SocietaireView());
  },


});
