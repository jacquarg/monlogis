'use-strict';

const get = require('../lib/walktree_utils').get;
const CozyModel = require('../lib/backbone_cozysingleton');

module.exports = CozyModel.extend({
  docType: 'fr.maif.maifuser.foyer',

  parse: function () {
    //eslint-disable-next-line
    const attr = CozyModel.prototype.parse.apply(this, arguments);
    $.extend(attr, get(attr, 'foyer'));
    return attr;
  },

});
