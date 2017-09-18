'use strict'

const VendorItemView = require('./vendor_item')
const template = require('./templates/menu')
const nameVersion = require('lib/appname_version')

const VendorsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: '',
  childView: VendorItemView,

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showSelected)
  },

  showSelected: function (houseItem) {
    this.$('li').toggleClass('selected', false)
    const item = this.children.findByModel(houseItem)
    if (item) item.$el.toggleClass('selected', true)
  },

})

module.exports = Mn.View.extend({
  template: template,

  ui: {
    logisLabel: '.logis > span',
  },

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  events: {
    'click @ui.logisLabel': () => app.trigger('houseitemdetails:show', app.logis),
  },

  triggers: {
    'click .add': 'show:addvendors',
    'click .howitworks': 'show:howitworks',
  },

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showSelected)
  },

  serializeData: function () {
    //eslint-disable-next-line
    const data = Mn.View.prototype.serializeData.call(arguments)
    data.nameVersion = nameVersion
    return data
  },

  onRender: function () {
    this.showChildView('collection', new VendorsView({ collection: this.collection }))
  },

  showSelected: function (houseItem) {
    this.ui.logisLabel.toggleClass('selected', houseItem === app.logis)
  },

})
