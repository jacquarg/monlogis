'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const Bill = require('models/bill');

module.exports = CozyCollection.extend({
  model: Bill,

  sort: 'date',
  initialize: function (options) {
    this.vendor = options.vendor;
  },

  getFetchIndex: function () { return ['vendor', 'date']; },
  getFetchQuery: function () {
    return { selector: { vendor: this.vendor } };
  },

});
