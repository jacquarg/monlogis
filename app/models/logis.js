'use-strict'

const VendorModel = require('./vendor_base')

module.exports = VendorModel.extend({
  docType: 'org.fing.mesinfos.logis',

  toFetch: function () {
    return [
      this.getFiles().fetch(),
      this._computeBudget(),
    ]
  },

  // deactivate this, as no bills field.
  injectBillsInFiles: () => undefined,

  _getBillsVendor: () => 'logis',

  getFolderPath: function () {
    return '/Administration/Mon Logis'
  },

  getBudget: function () {
    return this.budget || {}
  },

  _computeBudget: function () {
    return Promise.all(app.vendors.map(vendor => vendor.fetchAll()))
    .then(() => {
      const mensual = app.vendors
        .map(vendor => vendor.getBudget())
        .reduce((sum, budget) => sum + (budget.mensual || 0), 0)

      this.budget = {
        mensual: mensual,
        daily: mensual / 30,
        annual: mensual * 12,
      }
      return this.budget
    })
  },

  getHome: function () {
    const vendorEDF = app.vendors.findWhere({ slug: 'edf' })
    const vendorMaif = app.vendors.findWhere({ slug: 'maif' })

    let home = {
      address: {}
    }

    if (vendorEDF) {
      home.address = vendorEDF.client.get('address')

      // if (vendorEDF.home) // TODO !
      // housingType Type de logement parmi : Appartement, Maison
      // residenceType Type de résidence parmi : Principale, Secondaire
      // occupationType Type d'occupation parmi : Proprietaire, Locataire
    }

    if (vendorMaif && vendorMaif.home) {
      home = vendorMaif.home.get('home')[0]
    }

    return home
  },


})
