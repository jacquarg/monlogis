'use-strict';

module.exports = Backbone.Collection.extend({

  getFetchIndex: function () { return ['_id']; },

  getFetchQuery: function () { return { selector: { _id: { $gt: null } } }; },

  sync: function (method, collection, options) {
    if (method !== 'read') {
      console.error('Only read is available on this collection.');
      if (options.error) {
        options.error('Only read is available on this collection.');
      }
      return;
    }

    //eslint-disable-next-line
    const docType = new this.model().docType.toLowerCase();

    return cozy.client.data.defineIndex(docType, this.getFetchIndex())
    .then(index => cozy.client.data.query(index, this.getFetchQuery()))
    .then(options.success, options.error);
  },

});
