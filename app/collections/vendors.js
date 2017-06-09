'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const Vendor = require('models/vendor');

const AccountsCollection = require('./accounts');

module.exports = CozyCollection.extend({
  model: Vendor,

  init: function () {
    // init with
    // * saved vendors in db
    // * accounts
    // * examples ?
    this.accounts = new AccountsCollection();
    return Promise.all([
      this.fetch(),
      this.accounts.fetch(),
    ])
    .then(() => {
      const konnectorsBySlug = _.indexBy(app.konnectors, 'slug');
      this.accounts.filter((account) => {
        const konnector = konnectorsBySlug[account.get('account_type')];
        return konnector && ['isp', 'telecom', 'energy', 'insurance'].indexOf(konnector.category) !== -1;
      })
      .forEach((account) => {
        if (this.some(v => v.get('slug') === account.get('account_type'))) { return; }

        const konnector = konnectorsBySlug[account.get('account_type')];
        const vendor = new Vendor({
          slug: konnector.slug,
          name: konnector.name,
          folderPath: account.get('folderPath'),
          domain: konnector.domain,
        });
        this.add(vendor);
        vendor.save(); // TODO
      });

    })
  },
});
