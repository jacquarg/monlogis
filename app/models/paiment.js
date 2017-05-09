'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.paymentterms',
<<<<<<< 76c0bbd75d6e1427f5a133f0c0bd1449aeaa86e2
  getNextPaymentEDF: function () {
    // const paymentSchedules = this.get('paymentSchedules');
    // for (x of paymentSchedules) {
    //     return x.amount
    // }

      //  console.log('this is ', paymentSchedules[0].amount);
  },

=======

  getNextPaymentEDF: function () {
    const paymentSchedules = this.get('paymentSchedules');
    console.log(paymentSchedules);
    console.log(paymentSchedules[0]);
    console.log(paymentSchedules[0].amount);
      //  console.log('this is ', paymentSchedules[0].amount);
    return paymentSchedules[0].amount;
  },


>>>>>>> chercher les data contrat et consomation edf
});
