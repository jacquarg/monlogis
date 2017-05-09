'use-strict';

const template = require('views/templates/app_layout');
const MessageView = require('views/message');
const MystonesView = require('views/mystones');
const HouseitemDetailsEDFView = require('views/houseitems/details_edf');
<<<<<<< 76c0bbd75d6e1427f5a133f0c0bd1449aeaa86e2
const HouseitemDetailsVendorView = require('views/houseitems/details_vendor');
const VendorsView = require('views/houseitems/vendors');
const ObjectsView = require('views/houseitems/objects');
=======
const HouseConsomationEDFView = require('views/houseitems/consomation_edf');
>>>>>>> chercher les data contrat et consomation edf
const InfosClientView = require('views/infos_client');
const ContractClientView = require('views/contract_client');

module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',
  behaviors: {},

  regions: {
    message: '.message',
    myStones: '.mystones',
    houseitemDetails: '.houseitemdetails',
<<<<<<< 76c0bbd75d6e1427f5a133f0c0bd1449aeaa86e2
    vendors: '.vendors',
    equipments: '.equipments',
    objects: '.objects',
=======
    houseConsomation: '.consomation',
>>>>>>> chercher les data contrat et consomation edf
    infosClient: '.client',
    contractClient: '.contract',
  },

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showHouseItemDetails);
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('myStones', new MystonesView());
    this.showChildView('vendors', new VendorsView({ collection: app.vendors }));
    this.showChildView('equipments', new ObjectsView({
      model: new Backbone.Model({ title: 'Mes équipements' }),
      collection: app.equipments,
    }));
    this.showChildView('objects', new ObjectsView({
      model: new Backbone.Model({ title: 'Mes objets' }),
      collection: app.objects,
    }));
  },

  showHouseItemDetails: function (houseItem) {
    const slug = houseItem.get('slug');
    let ViewClass = null;
    if (slug === 'edf') {
      ViewClass = HouseitemDetailsEDFView;
    } else if (slug === 'maif') {
      console.log('todo');
      // viewClass = HouseitemDetailsMaifView;
    } else {
      ViewClass = HouseitemDetailsVendorView;
    }

    this.showChildView('houseitemDetails', new ViewClass({ model: houseItem }));
    this.showChildView('houseitemDetails', new HouseitemDetailsEDFView());
    this.showChildView('infosClient', new InfosClientView());
    this.showChildView('contractClient', new ContractClientView());
    this.showChildView('houseConsomation', new HouseConsomationEDFView());
  },
});
