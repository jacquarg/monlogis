'use strict';

const DetailsVendorView = require('./details_vendor');
const template = require('../templates/houseitems/details_maif');
const ContractMaif = require('../../models/contract');
const PaymenttermsView = require('./paymentterms');
// const SocietaireView = require('./societaire_maif');
const FoyerView = require('./foyer_maif');
const HomeView = require('./home_maif');
const SinistreView = require('./sinistre');
const SinistreCollection = require('collections/sinistre');
const FilesView = require('./files');

module.exports = DetailsVendorView.extend({
  template: template,


  regions: {
    files: '.files',
    budget: '.budget',
    sinistres: '.sinistres',
    paymentterms: '.paymentterms',
    foyer: '.foyer',
    home: '.home',
    // societaireMaif: '.societaireMaif',
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.contract = this.model.getContract().toJSON();
    // data.
    // if (this.model.contract) {

    // }
    console.log(data);
    return data;
  },

  onRender: function () {
    DetailsVendorView.prototype.onRender.apply(this, arguments);
    this.showChildView('paymentterms', new PaymenttermsView({ vendor: 'maif', contract: this.model.getContract() }));
    this.showChildView('foyer', new FoyerView({ model: this.model.getFoyer() }));
    this.showChildView('home', new HomeView({ model: this.model.getHome() }));

    // this.showChildView('sinistres', new SinistreView({
    //   model: new Backbone.Model({ slug: 'Maif' }),
    //   collection: this.sinistres,
    // }));
    // this.showChildView('societaireMaif', new SocietaireView());
  },
});
