'use-strict';

const template = require('views/templates/app_layout');
const MessageView = require('views/message');
const MystonesView = require('views/mystones');
const HouseitemDetailsEDFView = require('views/houseitems/details_edf');
const VendorsView = require('views/houseitems/vendors');

module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',
  behaviors: {},

  regions: {
    message: '.message',
    myStones: '.mystones',
    houseitemDetails: '.houseitemdetails',
    vendors: '.vendors',
  },

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showHouseItemDetails);
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('myStones', new MystonesView());
    this.showChildView('vendors', new VendorsView());
  },

  showHouseItemDetails: function (houseItem) {
    const slug = houseItem.get('slug');
    let ViewClass = null;
    if (slug === 'edf') {
      ViewClass = HouseitemDetailsEDFView;
    } else if (slug === 'maif') {
      console.log('todo');
      // viewClass = HouseitemDetailsMaifView;
    }

    this.showChildView('houseitemDetails', new ViewClass());
  },
});
