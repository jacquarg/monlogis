'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

const BillsCollection = require('../collections/bills');
const FilesCollection = require('../collections/files');


module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.vendor',

  fetchAll: function () {
    return Promise.all([
      this.getFiles().fetch(),
      this.getBills().fetch(),
    ]).then(() => {
      this.trigger('fetchedall');
    });
  },

  createDir: function () {
    if (this.dirID) { return Promise.resolve(); }

    return cozy.client.files.createDirectoryByPath(this.getFolderPath())
    .then((dir) => {
      this.dirID = dir._id;
    });
  },

  getDirID: function () {
    return this.dirID;
  },

  getFolderPath: function () {
    return this.get('folderPath');
  },

  getFiles: function () {
    if (!this.files) {
      this.files = new FilesCollection({ folderPath: this.getFolderPath() });
    }
    return this.files;
  },

  // case may vary from a vendor to another...
  _getBillsVendor: function () {
    return this.get('name')
  },

  getBills: function () {
    if (!this.bills) {
      this.bills = new BillsCollection({ vendor: this._getBillsVendor() });
    }
    return this.bills;
  },

  getBudget: function () {
    // if (!this.budget) {
    //   this.budget = this._computeBudget();
    // }
    // return this.budget;
    return this._computeBudget();
  },

  _computeBudget: function () {
    // assume mensual bills, and always the same value
    const bill = this.getBills().last();
    if (!bill) { return {}; }

    const mensual = bill.get('amount');
    return {
      mensual: mensual,
      daily: mensual / 30,
      annual: mensual * 12,
    };
  },

});
