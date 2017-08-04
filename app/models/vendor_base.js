'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

const BillsCollection = require('../collections/bills')
const FilesCollection = require('../collections/files')


module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.vendor',

  fetchAll: function () {
    return Promise.all(this.toFetch())
    .then(() => this.createDir()).catch(err => console.warn(err))
    .then(() => {
      this.trigger('fetchedall')
    })
  },

  toFetch: function () {
    return [
      this.getFiles().fetch(),
      this.getBills().fetch(),
    ]
  },

  createDir: function () {
    if (this.dirID) { return Promise.resolve() }

    return cozy.client.files.createDirectoryByPath(this.getFolderPath())
    .then((dir) => {
      this.dirID = dir._id
    })
  },

  getDirID: function () {
    return this.dirID
  },

  getFolderPath: function () {
    return this.get('folderPath')
  },

  getFiles: function () {
    if (!this.files) {
      this.files = new FilesCollection({ folderPath: this.getFolderPath() })
    }
    return this.files
  },

  injectBillsInFiles: function () {
    this.getBills().each((bill) => {
      const file = this.getFiles().findWhere({ _id: bill.get('file') })
      if (file) {
        file.bill = bill
      }
    })
  },
  // case may vary from a vendor to another...
  _getBillsVendor: function () {
    return this.get('name')
  },

  getBills: function () {
    if (!this.bills) {
      this.bills = new BillsCollection({ vendor: this._getBillsVendor() })
    }
    return this.bills
  },

  getBudget: function () {
    // if (!this.budget) {
    //   this.budget = this._computeBudget()
    // }
    // return this.budget
    return this._computeBudget()
  },

  _computeBudget: function () {
    // assume mensual bills,
    // use mean of last slippery year
    let bills = this.getBills()
    const billsCount = bills.length
    if (billsCount === 0) { return {} }

    if (billsCount > 12) {
      bills = bills.slice(billsCount - 12)
    }

    const mensual = bills.reduce((sum, bill) => sum + bill.get('amount'), 0) / bills.length
    return {
      mensual: mensual,
      daily: mensual / 30,
      annual: mensual * 12,
    }
  },

})
