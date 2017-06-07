'use-strict';

const template = require('views/templates/app_layout');
const MessageView = require('views/message');
const MystonesView = require('views/mystones');
const HouseitemDetailsEDFView = require('views/houseitems/details_edf');
const HouseitemDetailsMaifView = require('views/houseitems/details_maif');
const HouseitemDetailsVendorView = require('views/houseitems/details_vendor');
const HouseitemDetailsObjectView = require('views/houseitems/details_object');
const VendorsView = require('views/houseitems/vendors');
const ObjectsView = require('views/houseitems/objects');


module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',
  behaviors: {},

  regions: {
    message: '.message',
    myStones: '.mystones',
    houseitemDetails: '.houseitemdetails',
    vendors: '.vendors',
    equipments: '.equipments',
    objects: '.objects',
    uploadFiles: '.upload',
  },


  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showHouseitemDetails);
    this.listenTo(app, 'houseitemdetails:close', this.onHouseitemDetailsClose);
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('myStones', new MystonesView());
    this.showChildView('vendors', new VendorsView({ collection: app.vendors }));
    // this.showChildView('equipments', new ObjectsView({
    //   model: new Backbone.Model({ title: 'Mes équipements' }),
    //   collection: app.equipments,
    // }));
    this.showChildView('objects', new ObjectsView({
      model: new Backbone.Model({ title: 'Mes objets' }),
      collection: app.objects,
    }));
  },

  showHouseitemDetails: function (houseItem) {
    const docType = houseItem.getDocType();
    const slug = houseItem.get('slug');
    let ViewClass = null;
    if (docType === 'org.fing.mesinfos.vendor') {
      if (slug === 'edf') {
        ViewClass = HouseitemDetailsEDFView;
      } else if (slug === 'maif') {
        console.log('todo');
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

    this.showChildView('houseitemDetails', new ViewClass({ model: houseItem }));

    // TODO : something cleaner !
    this.$('.mystones').hide();
    this.$('.houseitems').toggleClass('col-xs-8', false);
    this.$('.houseitems').toggleClass('col-xs-4', true);
    this.$('.houseitemdetails').show();
    this.$('.houseitemdetails').toggleClass('col-xs-8', true);
  },

  onHouseitemDetailsClose: function () {
    this.getRegion('houseitemDetails').empty();

    this.$('.mystones').show();
    this.$('.houseitems').toggleClass('col-xs-8', true);
    this.$('.houseitems').toggleClass('col-xs-4', false);
    this.$('.houseitemdetails').hide();
    this.$('.houseitemdetails').toggleClass('col-xs-8', false);
  },
});
