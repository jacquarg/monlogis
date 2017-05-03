'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

const Properties = CozySingleton.extend({
  docType: 'org.fing.mesinfos.monlogis.properties',
  defaults: _.extend({
    synthSets: {},
  }, CozySingleton.defaults),

  _promiseSave: function (attributes) {
    return new Promise((resolve, reject) => {
      this.save(attributes, { success: resolve, error: reject });
    });
  },

});

module.exports = new Properties();
