'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.consumptionstatement',

  getPeriodDuration: function () {
    return moment.duration(moment(this.get('end')) - moment(this.get('start')));
  },

  getValueAsKGSKE: function () {
    // https://www.unitjuggler.com/convertir-energy-de-kWh-en-kgSKE.html
    return get('value') * 0.12283503255128;
  },
});
