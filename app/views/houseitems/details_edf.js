'use strict';

const DetailsVendorView = require('./details_vendor');
const template = require('../templates/houseitems/details_edf');
const ConsomationView = require('./consomation_edf');
const PaymenttermsView = require('./paymentterms');


module.exports = DetailsVendorView.extend({
  template: template,

  regions: {
    budget: '.budget',
    consomation: '.consumption',
    paymentterms: '.paymentterms',
    files: '.files',
  },

  serializeData: function () {
    //eslint-disable-next-line
    const data = DetailsVendorView.prototype.serializeData.apply(this, arguments);
    if (this.model.client) {
      data.client = this.model.client.toJSON();
    }
    if (this.model.contract) {
      data.contract = this.model.contract.toJSON();
    }
    return data;
  },

  onRender: function () {
    //eslint-disable-next-line
    DetailsVendorView.prototype.onRender.apply(this, arguments);
    this.showChildView('consomation', new ConsomationView());
    this.showChildView('paymentterms', new PaymenttermsView({ vendor: 'edf' }));
  },

});
