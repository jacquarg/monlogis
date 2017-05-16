'use-strict';

const CozyModel = require('./backbone_cozymodel');

module.exports = CozyModel.extend({

  sync: function (method, model, options) {
    if (method === 'read' && model.isNew() && !options.indexName) {
      options.indexName = 'Singleton';
      options.index = ['_id'];
      options.selector = { _id: { $gt: null } };
    }

    return CozyModel.prototype.sync.call(this, method, model, options);
  },
});
