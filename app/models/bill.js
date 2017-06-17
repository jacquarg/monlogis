'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'io.cozy.bills',

  parse: function () {
    const attr = CozyModel.prototype.parse.apply(this, arguments);
    if (attr.vendor === 'EDF') {
      attr.amount = attr.value;
    }
    return attr;
  },
});
