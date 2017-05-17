'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.insuranceclaim',
  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['type'], selector: { type: 'Habitation' } });
  },
});
