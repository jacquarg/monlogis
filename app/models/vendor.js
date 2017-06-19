'use-strict';

const VendorBase = require('./vendor_base');
const VendorEDF = require('./vendor_edf');
const VendorMaif = require('./vendor_maif');

module.exports = function (attributes) {
  if (attributes) {
    switch (attributes.slug) {
      case 'edf': return new VendorEDF(attributes);
      case 'maif': return new VendorMaif(attributes);
      default: break;
    }
  }
  return new VendorBase(attributes);
};
