'use-strict';

const template = require('../templates/houseitems/vendor_item');

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  events: {
    //eslint-disable-next-line
    'click': 'showDetails',
  },

  modelEvents: {
    change: 'render',
  },

  showDetails: function () {
    app.trigger('houseitemdetails:show', this.model);
  },

});
