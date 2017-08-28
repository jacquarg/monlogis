'use strict'

const DetailsVendorView = require('./details_vendor')
// const template = require('../templates/houseitems/logis')
const template = require('../templates/houseitems/logis')

// const HomeView = require('./home_maif')

module.exports = DetailsVendorView.extend({
  template: template,
  className: 'logis',
  regions: {
    files: '.files',
    budget: '.budget',
    // foyer: '.foyer',
    // home: '.home',
  },

  serializeData: function () {
    const data = {
      home: this.model.getHome().toJSON()
    }
    return data
  },

  //
  // onRender: function () {
  //   //eslint-disable-next-line
  //   DetailsVendorView.prototype.onRender.apply(this, arguments)
  //   this.showChildView('paymentterms', new PaymenttermsView({ vendor: 'maif', contract: this.model.getContract() }))
  //   this.showChildView('foyer', new FoyerView({ model: this.model.getFoyer() }))
  //   this.showChildView('home', new HomeView({ model: this.model.getHome() }))
  //
  //   // this.showChildView('sinistres', new SinistreView({
  //   //   model: new Backbone.Model({ slug: 'Maif' }),
  //   //   collection: this.sinistres,
  //   // }))
  //   // this.showChildView('societaireMaif', new SocietaireView())
  // },
})
