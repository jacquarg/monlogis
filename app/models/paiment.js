'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.paymentterms',
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
