'use-strict';

const appName = require('../lib/appname_version');

module.exports = Backbone.Model.extend({
  docType: '',
  defaults: {
    docTypeVersion: appName,
  },

  parse: function (raw) {
    raw.id = raw._id;
    return raw;
  },

  sync: function (method, model, options) {
    return this.syncPromise(method, model, options)
    .then(options.success, (err) => {
      console.error(err);
      options.error(err);
    });
  },

  syncPromise: function (method, model, options) {
    if (method === 'create') {
      return cozy.client.data.create(this.docType, model.attributes);
    } else if (method === 'update') {
      // TODO !!
      return cozy.client.data.update(this.docType, model.attributes, model.attributes);
    } else if (method === 'patch') {
      // TODO !!
      return cozy.client.data.updateAttributes(this.docType, model.attributes_id, model.attributes);
    } else if (method === 'delete') {
      return cozy.client.data.delete(this.docType, model.attributes);
    } else if (method === 'read') {
      if (options.indexName && options.indexName !== '') {
        return this._fetchFirstWithSelector(options.indexName, options.index, options.selector);
      }

      return cozy.client.data.find(this.docType, model.attributes._id);
    }
  },


  _fetchFirstWithSelector: function (name, index, selector) {
    const propName = `index${name}`;
    this[propName] = this[propName] || cozy.client.data.defineIndex(this.getDocType(), index);

    return this[propName]
      .then(index => cozy.client.data.query(index, { selector: selector, limit: 1 }))
      .then(res => ((res && res.length !== 0) ? res[0] : {}));
  },

  getDocType: function () {
    return Object.getPrototypeOf(this).docType;
  }
});
