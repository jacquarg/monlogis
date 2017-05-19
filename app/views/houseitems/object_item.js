'use-strict';

const template = require('../templates/houseitems/object_item');

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  ui: {
    icon: 'img',
  },

  events: {
    //eslint-disable-next-line
    'click': 'showDetails',
  },

  modelEvents: {
    change: 'render',
    newIconUrl: 'render',
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.iconUrl = this.model.getIconUrl();
    return data;
  },

  onRender: function () {
    // this.ui.icon.on('error', (ev) => {
    //   ev.target.src = 'assets/img/gift_icon.png';
    // });
  },

  showDetails: function () {
    app.trigger('houseitemdetails:show', this.model);
  },

});
