'use-strict';

const VendorModel = require('./vendor_base');

const Contract = require('./contract_maif');
const Foyer = require('./foyer');
const Home = require('./home');

module.exports = VendorModel.extend({

  toFetch: function () {
    return [
      this.getFiles().fetch(),
      this.getContract().fetch(),
      this.getFoyer().fetch(),
      this.getHome().fetch(),
    ];
  },

  getContract: function () {
    if (!this.contract) {
      this.contract = new Contract();
    }
    return this.contract;
  },

  getFoyer: function () {
    if (!this.foyer) {
      this.foyer = new Foyer();
    }
    return this.foyer;
  },

  getClient: function () {
    if (!this.client) {
      this.client = new Client();
    }
    return this.client;
  },

  getHome: function () {
    if (!this.home) {
      this.home = new Home();
    }
    return this.home;
  },

  _computeBudget: function () {
    const yearly = this.contract.get('montantTarifTtc');
    return {
      mensual: yearly / 12,
      daily: yearly / 12 / 30,
      annual: yearly,
    };
  },

});
