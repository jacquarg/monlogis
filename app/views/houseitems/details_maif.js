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
const FilesView = require('./files');

module.exports = Mn.View.extend({
  template: template,

  regions: {
    // sinistreHabitat: '.sinistreHabitat',
    sinistres: '.sinistres',
    homeMaif: '.homeMaif',
    foyerMaif: '.foyerMaif',
    societaireMaif: '.societaireMaif',
    paymentterms: '.paymentterms',
    files: '.files',
  },

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  triggers: {
    'click .close': 'close',
  },

  initialize: function () {
    this.model.getFiles().fetch();

    this.contract = new ContractMaif();
    this.contract.fetchMaif();
    this.sinistres = new SinistreCollection({ vendor: 'Maif' });
    this.sinistres.fetch();
  },

  serializeData: function () {
    const data = this.contract.toJSON();
    return data;
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
    this.showChildView('files', new FilesView({ model: this.model, }));
  },

  onClose: function () {
    app.trigger('houseitemdetails:close');
  },

});
