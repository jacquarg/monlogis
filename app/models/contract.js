'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.contract',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } })
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'Maif' } })
  },
})
