'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const Vendor = require('models/vendor');

module.exports = CozyCollection.extend({
  model: Vendor,
});
