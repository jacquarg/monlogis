'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')

const AccountsCollection = require('./accounts')
const Vendor = require('models/vendor')

module.exports = CozyCollection.extend({
  model: Vendor,


  init: function () {
    // init with
    // * saved vendors in db
    // * accounts
    // * examples ?
    this.accounts = new AccountsCollection()
    return Promise.all([
      this.fetch(),
      this.accounts.fetch(),
    ])
    .then(() => {
      const konnectorsBySlug = _.indexBy(app.konnectors, 'slug')
      const targetAccounts = this.accounts.filter((account) => {
        const konnector = konnectorsBySlug[account.get('account_type')]
        return konnector
          && ['isp', 'telecom', 'energy', 'insurance'].indexOf(konnector.category) !== -1
          && ['orangemobile', 'orangelivebox'].indexOf((konnector.slug)) === -1
      })

      return funpromise.series(targetAccounts, (account) => {
        let vendor = this.findWhere({ slug: account.get('account_type') })
        // if (this.some(v => v.get('slug') === account.get('account_type'))) { return }
        if (!vendor) {
          const konnector = konnectorsBySlug[account.get('account_type')]
          vendor = new Vendor({
            slug: konnector.slug,
            name: konnector.name,
            folderPath: account.has('auth') ? account.get('auth').folderPath : '',
            login: account.has('auth') ? account.get('auth').login : '',
            domain: konnector.domain,
          })
          this.add(vendor)
          vendor.save() // TODO
        }
        vendor.account = account
        return app.logis.attachVendor(vendor)
      })
    })
  },
})
