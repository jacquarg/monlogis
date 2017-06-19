'use-strict';

const template = require('views/templates/app_layout');
const MessageView = require('views/message');
// const MystonesView = require('views/mystones');
const HouseitemDetailsEDFView = require('views/houseitems/details_edf');
const HouseitemDetailsMaifView = require('views/houseitems/details_maif');
const HouseitemDetailsVendorView = require('views/houseitems/details_vendor');
const HouseitemDetailsObjectView = require('views/houseitems/details_object');
const MenuView = require('views/menu');
// const ObjectsView = require('views/houseitems/objects');
const AddVendorsView = require('views/add_vendors');


module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',
  behaviors: {},

  regions: {
    message: '.message',
    // myStones: '.mystones',
    main: 'main',
    menu: 'aside',
    // equipments: '.equipments',
    // objects: '.objects',
  },


  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showHouseitemDetails);
    // this.listenTo(app, 'houseitemdetails:close', this._closeMain);
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    // this.showChildView('myStones', new MystonesView());
    this.showChildView('menu', new MenuView({ collection: app.vendors }));
    // this.showChildView('equipments', new ObjectsView({
    //   model: new Backbone.Model({ title: 'Mes équipements' }),
    //   collection: app.equipments,
    // }));
    // this.showChildView('objects', new ObjectsView({
    //   model: new Backbone.Model({ title: 'Mes objets' }),
    //   collection: app.objects,
    // }));
  },

  showHouseitemDetails: function (houseItem) {
    const docType = houseItem.getDocType();
    const slug = houseItem.get('slug');
    let ViewClass = null;
    if (docType === 'org.fing.mesinfos.vendor') {
      if (slug === 'edf') {
        ViewClass = HouseitemDetailsEDFView;
      } else if (slug === 'maif') {
        ViewClass = HouseitemDetailsMaifView;
      } else {
        ViewClass = HouseitemDetailsVendorView;
      }
    } else if (docType === 'org.fing.mesinfos.object') {
      const type = houseItem.get('type');
      if (type === 'object') {
        ViewClass = HouseitemDetailsObjectView;
      }
    } else {
      ViewClass = HouseitemDetailsObjectView;
    }

    this._showMain(new ViewClass({ model: houseItem }));
  },

  _showMain: function (view) {
    this.showChildView('main', view);

    // // TODO : something cleaner !
    // this.$('.mystones').hide();
    // this.$('.houseitems').toggleClass('col-xs-8', false);
    // this.$('.houseitems').toggleClass('col-xs-3', true);
    // this.$('Main').show();
    // this.$('Main').toggleClass('col-xs-9', true);
  },

  _closeMain: function () {
    this.getRegion('main').empty();

    // this.$('.mystones').show();
    // this.$('.houseitems').toggleClass('col-xs-8', true);
    // this.$('.houseitems').toggleClass('col-xs-3', false);
    // this.$('Main').hide();
    // this.$('Main').toggleClass('col-xs-9', false);
  },

  onChildviewShowAddvendors: function () {
    this._showMain(new AddVendorsView());
  },
});
