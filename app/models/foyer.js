'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.foyer',

  getFoyerMaif: function () {
    const membres = this.get('membres');
    if (membres && membres instanceof Array) {
      //eslint-disable-next-line
      for (const value of membres) {
        return `${value.name.prefix} ${value.name.family}  ${value.name.given}`;
      }
    }
  },

});
