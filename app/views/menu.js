'use strict';

const VendorItemView = require('./vendor_item');
const template = require('./templates/menu');

const VendorsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: '',
  childView: VendorItemView,

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showSelected);
  },

  showSelected: function (houseItem) {
    this.$('li').toggleClass('selected', false);
    const item = this.children.findByModel(houseItem);
    console.log(item);
    item.$el.toggleClass('selected', true);
  },

});

module.exports = Mn.View.extend({
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  triggers: {
    'click .add': 'show:addvendors',
  },

  onRender: function () {
    this.showChildView('collection', new VendorsView({ collection: this.collection }));
  },
});
