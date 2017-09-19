'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Logis = require('models/logis')
const Home = require('models/home')

module.exports = CozyCollection.extend({
  model: Logis,
  sort: item => item.getName(),
  init: function () {
    // init with
    // * saved Logis in db
    // * new adresses from EDF or Maif

    const homeDocument = new Home()
    return Promise.all([
      this.fetch(),
      homeDocument.fetch(), // TODO : if no home !! ?
    ])
    .then((res) => {
      homeDocument.get('home').forEach((home) => {
        let logis = this.find(logis => _.isEqual(logis.get('address'), home.address))
        if (!logis) {
          logis = new Logis({
            address: home.address,
          })
          this.add(logis)
          logis.save()
        }
        logis.maifHome = home
      })
    })
  },

  attachVendor: function (vendor) {
    if (this.some(logis => logis.get('vendors').some(id => id === vendor.get('_id')))) return Promise.resolve()
    // else
    const logis = this.at(0)
    logis.get('vendors').push(vendor.get('_id'))

    return logis.save()
  },
})
