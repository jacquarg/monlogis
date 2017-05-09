'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const Bill = require('models/bill');

module.exports = CozyCollection.extend({
  model: Bill,

  initialize: function (options) {
    this.vendor = options.vendor;
  },

  getFetchIndex: function () { return ['vendor']; },
  getFetchQuery: function () {
    return { selector: { vendor: this.vendor } };
  },

});
