'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const AnObject = require('models/object');

module.exports = CozyCollection.extend({
  model: AnObject,

  getFetchIndex: () => ['type'],
  getFetchQuery: () => ({ selector: { type: 'equipment' } }),
});
