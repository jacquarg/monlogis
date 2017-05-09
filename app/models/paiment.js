'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.paymentterms',
  getNextPaymentEDF: function () {
    // const paymentSchedules = this.get('paymentSchedules');
    // for (x of paymentSchedules) {
    //     return x.amount
    // }

      //  console.log('this is ', paymentSchedules[0].amount);
  },


});
