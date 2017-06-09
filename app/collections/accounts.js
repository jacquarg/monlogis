'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const Model = require('models/account');

module.exports = CozyCollection.extend({
  model: Model,
});
