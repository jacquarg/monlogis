'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.paymentterms',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } });
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'Maif' } });
  },

  getNextPaymentEDF: function () {
    const paymentSchedules = this.get('paymentSchedules');
    if (paymentSchedules && paymentSchedules instanceof Array) {
      for (const value of paymentSchedules) {
        if (value.paid === false) {
          return value.amount + '€' + ' ' + 'le' + ' ' + value.scheduleDate;
        }
      }
    }
  },

  getLastPaymentEDF: function () {
    const paymentSchedules = this.get('paymentSchedules');
    if (paymentSchedules && paymentSchedules instanceof Array) {
      let prec;
      for (const value of paymentSchedules) {
        if (value.paid === false) {
          return prec;
        }
        prec = value.amount + '€' + ' ' + 'le' + ' ' + value.scheduleDate;
      }
    }
  },
});
