(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("application.js", function(exports, require, module) {
'use-strict';

// Main application that create a Mn.Application singleton and
// exposes it.
const Router = require('router');
const AppLayout = require('views/app_layout');
const Properties = require('models/properties');

const VendorsCollection = require('collections/vendors');
const EquipmentsCollection = require('collections/equipments');
const ObjectsCollection = require('collections/objects');


require('views/behaviors');

const Application = Mn.Application.extend({

  prepare: function () {
    this._splashMessages();

    const appElem = $('[role=application]')[0];

    this.cozyDomain = appElem.dataset.cozyDomain;
    cozy.client.init({
      cozyURL: `//${this.cozyDomain}`,
      token: appElem.dataset.cozyToken,
    });
    cozy.bar.init({ appName: 'Mon Logis' });

    this.properties = Properties;

    this.vendors = new VendorsCollection([ // TODO: fetch
      {
        name: 'EDF',
        slug: 'edf',
        domain: 'energy',
        konnectorAccount: null,
        folderPath: '/Administration/EDF/',
      },
      {
        name: 'Maif',
        slug: 'maif',
        domain: 'insurance',
        konnectorAccount: null,
        folderPath: '/Administration/Maif/',
      },
      // {
      //   name: 'Free',
      //   slug: 'free',
      //   domain: 'telecom',
      //   konnectorAccount: null,
      //   folderPath: '/folderPath',
      // },
    ]);

    this.equipments = new EquipmentsCollection([
      {
        name: 'Chauffe Eau',
        slug: 'waterheater',
        type: 'equipment',
        folderPath: '',
      },
      {
        name: 'Réfrigérateur',
        slug: 'fridge',
        type: 'equipment',
        folderPath: '',
      },
    ]); // TODO: fetch
    this.objects = new ObjectsCollection([
      {
        name: 'Macbook',
        slug: 'laptop',
        type: 'object',
        folderPath: '',
      },
    ]);
    this.objects.fetch();

    return this.properties.fetch()
    .then(() => this._defineViews());
  },

  prepareInBackground: function () {
  //   return Promise.resolve()
  //   .catch(err => this.trigger('message:error', err));
  },

  _splashMessages: function () {
    this.listenTo(this, 'message:display message:error',
      message => $('#splashmessage').html(message));
  },

  _defineViews: function () {
    this.trigger('message:display', "Préparation de l'application", 'defineviews');
    return Promise.all([])
    .then(() => this.trigger('message:hide', 'defineviews'))
    .catch((err) => {
      console.err(err);
      this.trigger('message:error', 'Erreur à la définition des vues.');
    });
  },

  onBeforeStart: function () {
    this.layout = new AppLayout();
    this.router = new Router();

    if (typeof Object.freeze === 'function') {
      Object.freeze(this);
    }
  },

  onStart: function () {
    this.layout.render();
    // prohibit pushState because URIs mapped from cozy-home rely on fragment
    if (Backbone.history) {
      Backbone.history.start({ pushState: false });
    }
  },
});

const application = new Application();

module.exports = application;
window.app = application;

document.addEventListener('DOMContentLoaded', () => {
  application.prepare()
  .catch((err) => {
    const msg = "Erreur pendant la préparation de l'application";
    console.error(msg);
    console.error(err);
    application.trigger('message:error', msg);
  })
  .then(() => application.prepareInBackground())
  .then(() => application.start())
  .catch((err) => {
    const msg = "Erreur au lancement de l'application";
    console.error(msg);
    console.error(err);
    application.trigger('message:error', msg);
  });
});


});

require.register("collections/bills.js", function(exports, require, module) {
'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const Bill = require('models/bill');

module.exports = CozyCollection.extend({
  model: Bill,

  initialize: function (options) {
    this.vendor = options.vendor;
  },

  getFetchIndex: function () { return ['vendor']; },
  getFetchQuery: function () {
    return { selector: { vendor: this.vendor } };
  },

});

});

require.register("collections/equipments.js", function(exports, require, module) {
'use-strict';

const ObjetsCollection = require('./objects');

module.exports = ObjetsCollection.extend({

  getFetchQuery: () => ({ selector: { type: 'equipment' } }),

  getDummyItemAttrs: () => ({
      name: 'Mon objet',
      slug: 'newOjbect',
      type: 'object',
      folderPath: '',
  }),
});

});

require.register("collections/files.js", function(exports, require, module) {
'use-strict';

const File = require('models/file');

module.exports = Backbone.Collection.extend({
  model: File,

  initialize: function (options) {
    this.folderPath = options.folderPath;
  },

  sync: function (method, collection, options) {
    if (method !== 'read') {
      console.error('Only read is available on this collection.');
      if (options.error) {
        options.error('Only read is available on this collection.');
      }
      return;
    }

    cozy.client.files.statByPath(this.folderPath)
    .then(dir => dir.relations('contents'))
    .then(options.success, options.error);
  },
});

});

require.register("collections/objects.js", function(exports, require, module) {
'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const AnObject = require('models/object');

module.exports = CozyCollection.extend({
  model: AnObject,

  initialize: function () {
    this.addDummyItem();
    this.listenTo(this, 'all', this.addDummyItem);
  },

  getDummyItemAttrs: () => ({
      name: 'Mon objet',
      slug: 'newOjbect',
      type: 'object',
      folderPath: '',
  }),

  addDummyItem: function () {
    if (this.some(el => el.isNew())) { return; }

    this.add(new AnObject(this.getDummyItemAttrs()));
  },

  getFetchIndex: () => ['type'],
  getFetchQuery: () => ({ selector: { type: { $gt: 'equipment' } } }),
});

});

require.register("collections/vendors.js", function(exports, require, module) {
'use-strict';

const CozyCollection = require('../lib/backbone_cozycollection');
const Vendor = require('models/vendor');

module.exports = CozyCollection.extend({
  model: Vendor,
});

});

require.register("lib/appname_version.js", function(exports, require, module) {
'use-strict';

const name = 'monlogis';
// use brunch-version plugin to populate these.
const version = '0.0.1';

module.exports = `${name}-${version}`;

});

require.register("lib/async_promise.js", function(exports, require, module) {
'use-strict';

module.exports.series = function (iterable, callback, self) {
  const results = [];

  return iterable.reduce((sequence, id, index, array) => {
    return sequence.then((res) => {
      results.push(res);
      return callback.call(self, id, index, array);
    });
  }, Promise.resolve(true))
  .then(res => new Promise((resolve) => { // don't handle reject there.
    results.push(res);
    resolve(results.slice(1));
  }));
};

const waitPromise = function (period) {
  return new Promise((resolve) => { // this promise always resolve :)
    setTimeout(resolve, period);
  });
};

module.exports.find = function (iterable, predicate, period) {
  const recursive = (list) => {
    const current = list.shift();
    if (current === undefined) { return Promise.resolve(undefined); }

    return predicate(current)
    .then((res) => {
      if (res === false) {
        return waitPromise(period).then(() => recursive(list));
      }

      return res;
    });
  };

  return recursive(iterable.slice());
};

module.exports.backbone2Promise = function (obj, method, options) {
  return new Promise((resolve, reject) => {
    options = options || {};
    options = $.extend(options, { success: resolve, error: reject });
    method.call(obj, options);
  });
};

});

require.register("lib/backbone_cozycollection.js", function(exports, require, module) {
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

    cozy.client.data.defineIndex(docType, this.getFetchIndex())
    .then(index => cozy.client.data.query(index, this.getFetchQuery()))
    .then(options.success, options.error);
  },

});

});

require.register("lib/backbone_cozymodel.js", function(exports, require, module) {
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
      console.log(err);
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

});

require.register("lib/backbone_cozysingleton.js", function(exports, require, module) {
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

});

require.register("lib/walktree_utils.js", function(exports, require, module) {
'use_strict';

module.exports.get = function (obj, ...prop) {
  return prop.reduce((current, key) => (current ? current[key] : undefined), obj);
};

module.exports.getFirst = function (obj) {
  return obj[Object.keys(obj)[0]];
};

});

require.register("models/bill.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'io.cozy.bill',
});

});

require.register("models/client.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.client',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } });
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'maif' } });
  },

});

});

require.register("models/consomation.js", function(exports, require, module) {
'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.consumptionstatement',
});

});

require.register("models/contract.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.contract',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } });
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'Maif' } });
  },
});

});

require.register("models/file.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'io.cozy.files',

  getFileUrl: function () {
    return cozy.client.files.getDownloadLinkById(this.get('_id'))
    .then(absolutePath => `//${app.cozyDomain}${absolutePath}`);
  },

});

});

require.register("models/foyer.js", function(exports, require, module) {
'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.foyer',
});

});

require.register("models/home.js", function(exports, require, module) {
'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.home',

});

});

require.register("models/object.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');
const FileModel = require('./file');
const BASE_DIR = '/Administration/objets/';

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.object',

  getFolderPath: function () {
    return `${BASE_DIR}${this.get('name')}`;
  },
  createDir: function () {
    if (this.has('dirID')) {
      return Promise.resolve();
    }

    return cozy.client.files.createDirectoryByPath(this.getFolderPath())
    .then(dir => this.set('dirID', dir._id));
  },

  setIconFileId: function (iconFileId) {
    this.set('iconFileId', iconFileId);
    this.iconFile = null;
    this.iconUrl = null;
  },

  getIconUrl: function () {
    if (this.iconUrl) {
      return this.iconUrl;
    }

    let defaultUrl = '/assets/img/gift_icon.png';

    this._fetchIcon()
    .catch((err) => {
      this.unset('iconFileId');
    });

    return defaultUrl;
  },

  _fetchIcon: function () {
    const iconId = this.get('iconFileId');

    if (!iconId) { return Promise.reject(); }

    this.iconFile = new FileModel({ _id: iconId });
    return this.iconFile.fetch()
    .then(() => this.iconFile.getFileUrl())
    .then((fileUrl) => {
      this.iconUrl = fileUrl;
      this.trigger('newIconUrl');
    });
  },
});

});

require.register("models/paymentterms.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.paymentterms',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } });
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'Maif' } });
  },

  getNextPaymentEDF: function () {
    const paymentSchedules = this.get('paymentSchedules');
    if (paymentSchedules && paymentSchedules instanceof Array) {
      for (const value of paymentSchedules) {
        if (value.paid === false) {
          return value.amount + '€' + ' ' + 'le' + ' ' + value.scheduleDate;
        }
      }
    }
  },

  getLastPaymentEDF: function () {
    const paymentSchedules = this.get('paymentSchedules');
    if (paymentSchedules && paymentSchedules instanceof Array) {
      let prec;
      for (const value of paymentSchedules) {
        if (value.paid === false) {
          return prec;
        }
        prec = value.amount + '€' + ' ' + 'le' + ' ' + value.scheduleDate;
      }
    }
  },
});

});

require.register("models/properties.js", function(exports, require, module) {
'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

const Properties = CozySingleton.extend({
  docType: 'org.fing.mesinfos.monlogis.properties',
  defaults: _.extend({
    synthSets: {},
  }, CozySingleton.defaults),

  _promiseSave: function (attributes) {
    return new Promise((resolve, reject) => {
      this.save(attributes, { success: resolve, error: reject });
    });
  },

});

module.exports = new Properties();

});

require.register("models/sinistre.js", function(exports, require, module) {
'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.insuranceclaim',
  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['type'], selector: { type: 'Habitation' } });
  },
});

});

require.register("models/vendor.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('../lib/backbone_cozymodel');

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.vendor',
});

});

require.register("router.js", function(exports, require, module) {
'use-strict';

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index',
  },
});

});

require.register("views/app_layout.js", function(exports, require, module) {
'use-strict';

const template = require('views/templates/app_layout');
const MessageView = require('views/message');
const MystonesView = require('views/mystones');
const HouseitemDetailsEDFView = require('views/houseitems/details_edf');
const HouseitemDetailsMaifView = require('views/houseitems/details_maif');
const HouseitemDetailsVendorView = require('views/houseitems/details_vendor');
const HouseitemDetailsObjectView = require('views/houseitems/details_object');
const VendorsView = require('views/houseitems/vendors');
const ObjectsView = require('views/houseitems/objects');


module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',
  behaviors: {},

  regions: {
    message: '.message',
    myStones: '.mystones',
    houseitemDetails: '.houseitemdetails',
    vendors: '.vendors',
    equipments: '.equipments',
    objects: '.objects',
    uploadFiles: '.upload',
  },

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showHouseItemDetails);
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('myStones', new MystonesView());
    this.showChildView('vendors', new VendorsView({ collection: app.vendors }));
    this.showChildView('equipments', new ObjectsView({
      model: new Backbone.Model({ title: 'Mes équipements' }),
      collection: app.equipments,
    }));
    this.showChildView('objects', new ObjectsView({
      model: new Backbone.Model({ title: 'Mes objets' }),
      collection: app.objects,
    }));
  },

  showHouseItemDetails: function (houseItem) {
    const docType = houseItem.getDocType();
    const slug = houseItem.get('slug');
    let ViewClass = null;
    if (docType === 'org.fing.mesinfos.vendor') {
      if (slug === 'edf') {
        ViewClass = HouseitemDetailsEDFView;
      } else if (slug === 'maif') {
        console.log('todo');
        ViewClass = HouseitemDetailsMaifView;
      } else {
        ViewClass = HouseitemDetailsVendorView;
      }
    } else if (docType === 'org.fing.mesinfos.object') {
      const type = houseItem.get('type');
      if (type === 'object') {
        ViewClass = HouseitemDetailsObjectView;
      }
    } else {
      ViewClass = HouseitemDetailsObjectView;
    }

    this.showChildView('houseitemDetails', new ViewClass({ model: houseItem }));
  },
});

});

require.register("views/behaviors/destroy.js", function(exports, require, module) {
'use-strict';

module.exports = Mn.Behavior.extend({
  events: {
    'click .delete': 'destroyObject',
  },

  destroyObject: function () {
    if (this.options.onDestroy) {
      this.view[this.options.onDestroy]();
    } else {
      this.view.model.destroy();
    }
  },
});

});

require.register("views/behaviors/index.js", function(exports, require, module) {
'use-strict';

Mn.Behaviors.behaviorsLookup = () => window.Behaviors;

window.Behaviors = {
  //eslint-disable-next-line
  Toggle: require('views/behaviors/toggle'),
  //eslint-disable-next-line
  Destroy: require('views/behaviors/destroy'),
};

});

require.register("views/behaviors/toggle.js", function(exports, require, module) {
'use-strict';

module.exports = Mn.Behavior.extend({
  triggers: {
    'click .toggle': 'toggle',
    'click @ui.toggle': 'toggle',
    'click .contract': 'contract',
    'click @ui.contract': 'contract',
    'click .expand': 'expand',
    'click @ui.expand': 'expand',
  },

  onExpand: function () {
    this.setExpanded(true);
  },

  onContract: function () {
    this.setExpanded(false);
  },

  onToggle: function () {
    this.setExpanded(!(this.$el.attr('aria-expanded') === 'true'));
  },

  setExpanded: function (isExpanded) {
    this.$el.attr('aria-expanded', isExpanded);
  },

  onRender: function () {
    this.onContract();
  },
});

});

require.register("views/houseitems/bill_item.js", function(exports, require, module) {
'use-strict';

const template = require('../templates/houseitems/bill_item');

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  events: {
    //eslint-disable-next-line
    'click': 'showDetails',
  },

  modelEvents: {
    change: 'render',
  },
});

});

require.register("views/houseitems/bills.js", function(exports, require, module) {
'use strict';

const BillItemView = require('./bill_item');
const template = require('../templates/houseitems/bills');

const BillsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: BillItemView,
});

module.exports = Mn.View.extend({
  // className: 'mymovies',
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('collection', new BillsView({ collection: this.collection }));
  },
});

});

require.register("views/houseitems/consomation_edf.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/consomation_edf');
const Consomation = require('../../models/consomation');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Consomation();
    this.model.fetch();
  },

  // onRender: function () {
  //
  // },


});

});

require.register("views/houseitems/contract_client.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/contract_client');
const Contract = require('../../models/contract');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Contract();
    this.model.fetchEDF();
  },

  // onRender: function () {
  //
  // },


});

});

require.register("views/houseitems/details_edf.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/details_edf');
const Paiment = require('../../models/paymentterms');
const ContractView = require('./contract_client');
const ConsomationView = require('./consomation_edf');
const PhoneDepannageView = require('./phone_depannage_edf');
const PhoneContactView = require('./phone_contact_edf');
const BillsView = require('./bills');
const BillsCollection = require('collections/bills');

module.exports = Mn.View.extend({
  template: template,

  regions: {
    bills: '.bills',
    contract: '.contract',
    consomation: '.consomation',
    phoneDepannage: '.phoneDepannage',
    phoneContact: '.phoneContact',
  },

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Paiment();
    this.model.fetchEDF();
    this.bills = new BillsCollection({ vendor: 'EDF' });
    this.bills.fetch();
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.nextPaymentAmount = this.model.getNextPaymentEDF();
    data.lastPaymentAmount = this.model.getLastPaymentEDF();
    return data;
  },

  // .holder= dernierReglement.type

  onRender: function () {
    this.showChildView('bills', new BillsView({
      model: new Backbone.Model({ slug: 'EDF' }),
      collection: this.bills,
    }));
    this.showChildView('contract', new ContractView());
    this.showChildView('consomation', new ConsomationView());
    this.showChildView('phoneDepannage', new PhoneDepannageView());
    this.showChildView('phoneContact', new PhoneContactView());
  },
});

});

require.register("views/houseitems/details_maif.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/details_maif');
const ContractMaif = require('../../models/contract');
const SinstreHabitatView = require('./sinistre_habitat');
const SocietaireView = require('./societaire_maif');
const FoyerView = require('./foyer_maif');
const HomeView = require('./home_maif');

module.exports = Mn.View.extend({
  template: template,

  regions: {
    sinistreHabitat: '.sinistreHabitat',
    homeMaif: '.homeMaif',
    foyerMaif: '.foyerMaif',
    societaireMaif: '.societaireMaif',
  },

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new ContractMaif();
    this.model.fetchMaif();
  },

  onRender: function () {
    this.showChildView('sinistreHabitat', new SinstreHabitatView());
    this.showChildView('homeMaif', new HomeView());
    this.showChildView('foyerMaif', new FoyerView());
    this.showChildView('societaireMaif', new SocietaireView());
  },


});

});

require.register("views/houseitems/details_object.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/details_object');
const FilesView = require('./files');
const FilesCollection = require('collections/files');
const UploadFile = require('./upload_file');

module.exports = Mn.View.extend({
  template: template,

  ui: {
    icon: 'img.objecticon',
    changeIcon: 'button#changeicon',
    inputName: 'input[name="name"]',
    inputDescription: 'textarea[name="description"]',
  },

  events: {
    'change @ui.inputName': 'onFormChange', // TODO : update FolderPath on name change.
    'change @ui.inputDescription': 'onFormChange',
    'click @ui.changeIcon': 'changeIcon',
  },

  modelEvents: {
    change: 'render',
    newIconUrl: 'render',
    newFile: 'updateFilesCollection',
  },

  regions: {
    files: '.files',
    addFile: '.addfile',
  },

  initialize: function () {
    this.files = new FilesCollection({ folderPath: this.model.getFolderPath() });
    this.files.fetch();

    console.log(this.files);
  },

  serializeData: function () {
    const data = this.model.toJSON();
    data.iconUrl = this.model.getIconUrl();
    return data;
  },

  onRender: function () {
    this.showChildView('files', new FilesView({
      model: this.model,
      collection: this.files,
    }));
    this.showChildView('addFile', new UploadFile({ model: this.model }));
  },

  onFormChange: function () {
    this.model.save({
      name: this.ui.inputName.val(),
      description: this.ui.inputDescription.val(),
    });
  },

  updateFilesCollection: function (file) {
    this.files.add(file);
  },

  // displayIcon: function (iconFile) {
  //   iconFile.getFileUrl().then((url) => {
  //     this.iconUrl = url;
  //     this.ui.icon.attr('src', url);
  //   });
  // },

  changeIcon: function () {
    //eslint-disable-next-line
    const imgFiles = this.files.filter(file => file.has('attributes') && file.get('attributes')['class'] === 'image');

<<<<<<< 26b16e9f82098480d8acb4033c0836962cf74615
    if (imgFiles.length === 0) { return; }
=======
    let iconFile = imgFiles.get(this.model.get('iconFileId'));
    let index = imgFiles.indexOf(iconFile);
    index = (index + 1) % imgFiles.size();
>>>>>>> chercher et afficher les donnees Maif

    const iconFileId = this.model.get('iconFileId');
    let iconFile = null;
    let index = 0;
    if (iconFileId) {
      iconFile = this.files.get(iconFileId);
      index = imgFiles.indexOf(iconFile);
      index = (index + 1) % imgFiles.length;
    }

    iconFile = imgFiles[index];

    this.model.setIconFileId(iconFile.get('_id'));
    this.model.save();
  },
});

});

require.register("views/houseitems/details_vendor.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/details_vendor');
const BillsView = require('./bills');
const FilesView = require('./files');
const BillsCollection = require('collections/bills');
const FilesCollection = require('collections/files');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  regions: {
    bills: '.bills',
    files: '.files',
  },

  initialize: function () {
    this.bills = new BillsCollection({ vendor: this.model.get('slug') });
    this.bills.fetch();

    this.files = new FilesCollection({ folderPath: this.model.get('folderPath') });
    this.files.fetch();
  },

  onRender: function () {
    this.showChildView('bills', new BillsView({
      model: this.model,
      collection: this.bills,
    }));

    this.showChildView('files', new FilesView({
      model: this.model,
      collection: this.files,
    }));
  },

});

});

require.register("views/houseitems/file_item.js", function(exports, require, module) {
'use-strict';

const template = require('../templates/houseitems/file_item');

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  events: {
    click: 'openFile',
  },

  modelEvents: {
    change: 'render',
  },

  openFile: function () {
    this.model.getFileUrl()
    .then((url) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = this.model.get('name');
      document.body.appendChild(link);
      link.click();
    });
  },

});

});

require.register("views/houseitems/files.js", function(exports, require, module) {
'use strict';

const FileItemView = require('./file_item');
const template = require('../templates/houseitems/files');

const FilesView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: FileItemView,
});

module.exports = Mn.View.extend({
  // className: 'mymovies',
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('collection', new FilesView({ collection: this.collection }));
  },
});

});

require.register("views/houseitems/foyer_maif.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/foyer_maif');
const FoyerMaif = require('../../models/foyer');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new FoyerMaif();
    this.model.fetch();
  },

  // onRender: function () {
  //
  // },


});

});

require.register("views/houseitems/home_maif.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/home_maif');
const HomeMaif = require('../../models/home');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new HomeMaif();
    this.model.fetch();
  },

  // onRender: function () {
  //
  // },


});

});

require.register("views/houseitems/object_item.js", function(exports, require, module) {
'use-strict';

const template = require('../templates/houseitems/vendor_item');

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  ui: {
    icon: 'img',
  },

  events: {
    //eslint-disable-next-line
    'click': 'showDetails',
  },

  modelEvents: {
    change: 'render',
  },

  onRender: function () {
    this.ui.icon.on('error', (ev) => {
      ev.target.src = 'assets/img/gift_icon.png';
    });
  },

  showDetails: function () {
    app.trigger('houseitemdetails:show', this.model);
  },

});

});

require.register("views/houseitems/objects.js", function(exports, require, module) {
'use strict';

const ObjectItemView = require('./object_item');
const template = require('../templates/houseitems/objects');

const ObjectsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: ObjectItemView,
});

module.exports = Mn.View.extend({
  // className: 'mymovies',
  template: template,


  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
    // newItem: '.newItem',
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('collection', new ObjectsView({ collection: this.collection }));
    // this.showChildView('newItem', new ObjectItemView({ model: new this.collection.model()}))
  },
});

});

require.register("views/houseitems/phone_contact_edf.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/phone_contact_edf');
const PhoneContact = require('../../models/client');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new PhoneContact();
    this.model.fetchEDF();
  },

  // onRender: function () {

  // },


});

});

require.register("views/houseitems/phone_depannage_edf.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/phone_depannage_edf');
const PhoneDeppanage = require('../../models/contract');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new PhoneDeppanage();
    this.model.fetchEDF();
  },

  // onRender: function () {
  //
  // },


});

});

require.register("views/houseitems/sinistre_habitat.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/sinistre_habitat');
const SinistreMaif = require('../../models/sinistre');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new SinistreMaif();
    this.model.fetch();
  },

  // onRender: function () {
  //
  // },


});

});

require.register("views/houseitems/societaire_maif.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/societaire_maif');
const SocietaireMaif = require('../../models/client');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new SocietaireMaif();
    this.model.fetchMaif();
  },

  // onRender: function () {
  //
  // },


});

});

require.register("views/houseitems/upload_file.js", function(exports, require, module) {
'use-strict';

const template = require('../templates/houseitems/upload_file');
const get = require('../../lib/walktree_utils').get;

module.exports = Mn.View.extend({
  template: template,

  ui: {
    inputFile: 'input[type="file"]',
    inputFileName: 'input[name="filename"]',
  },

  events: {
    'change @ui.inputFile': 'setDefaultName',
    'click button[name="addfile"]': 'uploadFile',
  },

  initialize: function () {
    // this.insights ...
  },

  setDefaultName: function () {
    if (!this.ui.inputFileName.val()) {
      const name = get(this.ui.inputFile, 0, 'files', 0, 'name');
      this.ui.inputFileName.val(name);
    }
  },

  uploadFile: function () {
    const file = get(this.ui.inputFile, 0, 'files', 0);
    const name = this.ui.inputFileName.val();

    if (file && name !== null) {
      app.trigger('message:display', 'Création du répertoire en cours ...', 'upload_file');
      this.model.createDir()
      .then(() => app.trigger('message:display', 'Téléversement du fichier en cours ...', 'upload_file'))
      .then(() => cozy.client.files.create(file, { name: name, dirID: this.model.get('dirID') }))
      .then((file) => {
        app.trigger('message:hide', 'upload_file');
        this.model.trigger('newFile', file);
      })
      .catch((err) => {
        app.trigger('message:hide', 'upload_file');
        app.trigger('message:error', 'Erreur lors du téléversement du fichier.');
        console.error(err);
      });
    } else {
      app.trigger('message:error', 'Fichier invalide, ou nom incomplet.');
    }
  },
});

});

require.register("views/houseitems/vendor_item.js", function(exports, require, module) {
'use-strict';

const template = require('../templates/houseitems/vendor_item');

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  events: {
    //eslint-disable-next-line
    'click': 'showDetails',
  },

  modelEvents: {
    change: 'render',
  },

  showDetails: function () {
    app.trigger('houseitemdetails:show', this.model);
  },

});

});

require.register("views/houseitems/vendors.js", function(exports, require, module) {
'use strict';

const VendorItemView = require('./vendor_item');
const template = require('../templates/houseitems/vendors');


const VendorsView = Mn.CollectionView.extend({
  tagName: 'ul',
  className: 'movielibrary',
  childView: VendorItemView,
});

module.exports = Mn.View.extend({
  // className: 'mymovies',
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('collection', new VendorsView({ collection: this.collection }));
  },
});

});

require.register("views/infos_client.js", function(exports, require, module) {
'use strict';

const template = require('./templates/infos_client');
const Client = require('../models/client');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Client();
    this.model.fetch();
  },

  // onRender: function () {

  // },


});

});

require.register("views/message.js", function(exports, require, module) {
'use-strict';

const template = require('views/templates/message');

module.exports = Mn.View.extend({
  tagName: 'div',
  template: template,

  ui: {
    message: '.display',
  },
  events: {
    'click .close': 'onClose',
  },

  initialize: function () {
    this.messages = {};
    this.listenTo(app, 'message:display', this.onDisplay);
    this.listenTo(app, 'message:hide', this.onHide);
    this.listenTo(app, 'message:error', this.onError);
  },

  serializeData: function () {
    return { messages: this.messages };
  },

  onError: function (message) {
    this.display({
      label: message.toString(),
      type: 'error',
      message: message,
    }, Math.ceil(Math.random() * 10000));
    console.error(`Emsg: ${message}`);
  },

  onDisplay: function (message, id) {
    this.display({
      type: 'info',
      label: message.toString(),
      message: message,
    }, id);
  },

  display: function (message, id) {
    this.messages[id] = message;
    this.render();
  },

  onClose: function (ev) {
    this.onHide(ev.currentTarget.dataset.messageid);
  },

  onHide: function (id) {
    delete this.messages[id];
    this.render();
  },
});

});

require.register("views/mystones.js", function(exports, require, module) {
'use strict';

const template = require('./templates/mystones');
const Home = require('../models/home');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Home();
    this.model.fetch();
  },

  onBeforeRender: function () {
    console.log('here');
    console.log(this.model.toJSON());
  },

  geocode: function () {
    const address = this.model.get('address');
    address.formated = `${address.street}+${address.city}+${address.country}`;
    return $.get(`//nominatim.openstreetmap.org/search?format=json&q=${address.formated}`)
    .then((res) => {
      console.log(res);
      address.point = res[0];
      return address.point;
    });
  },

  onRender: function () {
    if (this.model.isNew()) { return; }
    this.geocode()
    .then((point) => {
      const osmb = new OSMBuildings({
        position: {
          latitude: point.lat,
          longitude: point.lon,
        },

        zoom: 20,
        disabled: true,
        tilt: 180,
        rotation: 0,
        // fast: true,
      });

      osmb.appendTo('map');

      osmb.addMapTiles('https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
        {
          attribution: '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
        });

      osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
      osmb.highlight(point.osm_id, '#f08000');
      osmb.highlight(point.place_id, '#f08000');
    });
  }

});

});

require.register("views/templates/app_layout.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<main class=\"row\"><div class=\"col-xs-4 mystones\"><div class=\"well\">TODO : addresse</div></div><div class=\"col-xs-2 houseitems\"><div class=\"row vendors\"><div class=\"well\">TODO : Énergie - EDF</div></div><div class=\"row equipments\"><div class=\"well\">TODO : TV</div></div><div class=\"row objects\"><div class=\"well\">TODO : table</div></div></div><div class=\"col-xs-6 houseitemdetails\"></div></main><div class=\"container\"><main><div class=\"client\"></div></main></div><div class=\"message\"></div>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/bill_item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (amount, date, vendor) {
buf.push("<div class=\"billitem\"></div><p>" + (jade.escape(null == (jade_interp = vendor) ? "" : jade_interp)) + "&nbsp;" + (jade.escape(null == (jade_interp = date) ? "" : jade_interp)) + ", &nbsp;" + (jade.escape(null == (jade_interp = amount) ? "" : jade_interp)) + "€</p>");}.call(this,"amount" in locals_for_with?locals_for_with.amount:typeof amount!=="undefined"?amount:undefined,"date" in locals_for_with?locals_for_with.date:typeof date!=="undefined"?date:undefined,"vendor" in locals_for_with?locals_for_with.vendor:typeof vendor!=="undefined"?vendor:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/bills.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (title) {
buf.push("<h3 class=\"title-facture\">Mes facture:<br/></h3><h2>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</h2><ul></ul>");}.call(this,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/consomation_edf.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (end, period, start, value) {
buf.push("<h4>J'ai consomé &nbsp;");
if ( value)
{
buf.push(jade.escape(null == (jade_interp = value) ? "" : jade_interp));
}
buf.push("&nbsp kWh &nbsp; en periode de\n&nbsp");
if ( period)
{
buf.push(jade.escape(null == (jade_interp = period) ? "" : jade_interp));
}
buf.push("&nbsp (entre &nbsp");
if ( start)
{
buf.push(jade.escape(null == (jade_interp = start) ? "" : jade_interp));
}
buf.push("&nbsp et &nbsp");
if ( end)
{
buf.push(jade.escape(null == (jade_interp = end) ? "" : jade_interp));
}
buf.push(").<br/><br/></h4>");}.call(this,"end" in locals_for_with?locals_for_with.end:typeof end!=="undefined"?end:undefined,"period" in locals_for_with?locals_for_with.period:typeof period!=="undefined"?period:undefined,"start" in locals_for_with?locals_for_with.start:typeof start!=="undefined"?start:undefined,"value" in locals_for_with?locals_for_with.value:typeof value!=="undefined"?value:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/contract_client.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (contractSubcategory1, name, power) {
buf.push("<h4 class=\"payment\">Mon contrant &nbsp");
if ( name)
{
buf.push(jade.escape(null == (jade_interp = name) ? "" : jade_interp));
}
buf.push("&nbsp EDF\n, &nbsp");
if ( contractSubcategory1)
{
buf.push((jade.escape(null == (jade_interp = contractSubcategory1) ? "" : jade_interp)) + ", &nbsp");
}
if ( power)
{
buf.push((jade.escape(null == (jade_interp = power) ? "" : jade_interp)) + ".");
}
buf.push("</h4>");}.call(this,"contractSubcategory1" in locals_for_with?locals_for_with.contractSubcategory1:typeof contractSubcategory1!=="undefined"?contractSubcategory1:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"power" in locals_for_with?locals_for_with.power:typeof power!=="undefined"?power:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/details_edf.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (lastPaymentAmount, nextPaymentAmount) {
buf.push("<h3>Mon prochain paiment,&ensp;" + (jade.escape(null == (jade_interp = nextPaymentAmount) ? "" : jade_interp)) + ".<br/></h3><h3>Mon dernier paiment,&ensp;" + (jade.escape(null == (jade_interp = lastPaymentAmount) ? "" : jade_interp)) + ".<br/><br/></h3><div class=\"contract\"></div><div class=\"consomation\"></div><br/><div class=\"phoneDepannage\"></div><div class=\"phoneContact\"></div><div class=\"bills\"></div>");}.call(this,"lastPaymentAmount" in locals_for_with?locals_for_with.lastPaymentAmount:typeof lastPaymentAmount!=="undefined"?lastPaymentAmount:undefined,"nextPaymentAmount" in locals_for_with?locals_for_with.nextPaymentAmount:typeof nextPaymentAmount!=="undefined"?nextPaymentAmount:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/details_maif.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (societaire, startDate, vendor) {
buf.push("<h3>J'ai eu mon contrat &nbsp");
if ( vendor)
{
buf.push(jade.escape(null == (jade_interp = vendor) ? "" : jade_interp));
}
buf.push("&nbsp le &nbsp");
if ( startDate)
{
buf.push(jade.escape(null == (jade_interp = startDate) ? "" : jade_interp));
}
buf.push("&nbsp sous le numéro de &nbsp");
if ( societaire)
{
buf.push(jade.escape(null == (jade_interp = societaire) ? "" : jade_interp));
}
buf.push(".<br/></h3><div class=\"homeMaif\"></div><div class=\"foyerMaif\"></div><div class=\"sinistreHabitat\"></div><div class=\"societaireMaif\"></div><div class=\"col-md-6\"></div><p>Service client maif<br/></p><div class=\"col-md-6\"></div><p>&nbsp Tel:&nbsp 09 72 72 15 15</p>");}.call(this,"societaire" in locals_for_with?locals_for_with.societaire:typeof societaire!=="undefined"?societaire:undefined,"startDate" in locals_for_with?locals_for_with.startDate:typeof startDate!=="undefined"?startDate:undefined,"vendor" in locals_for_with?locals_for_with.vendor:typeof vendor!=="undefined"?vendor:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/details_object.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (description, iconUrl, name) {
buf.push("<div class=\"row\"><div class=\"col-md-4\"><img" + (jade.attr("src", iconUrl, true, false)) + " class=\"objecticon img-circle\"/><button id=\"changeicon\" type=\"button\" class=\"btn btn-default btn-xs\">modifier</button></div><div class=\"col-md-8\"><input name=\"name\" type=\"text\" placeholder=\"Nom de l'objet\"" + (jade.attr("value", name, true, false)) + " class=\"form-control\"/><textarea name=\"description\" rows=\"3\" placeholder=\"Description\" class=\"form-control\">" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "</textarea></div></div><div class=\"row\"><div class=\"col-md-6 addfile\"></div><div class=\"col-md-6 files\"></div></div>");}.call(this,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined,"iconUrl" in locals_for_with?locals_for_with.iconUrl:typeof iconUrl!=="undefined"?iconUrl:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/details_vendor.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name) {
buf.push("<h2>" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "</h2><div class=\"bills\"></div><div class=\"files\"></div>");}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/file_item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (attributes) {
if ( attributes)
{
buf.push(jade.escape(null == (jade_interp = attributes.name) ? "" : jade_interp));
}}.call(this,"attributes" in locals_for_with?locals_for_with.attributes:typeof attributes!=="undefined"?attributes:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/files.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<h3>Documents associés</h3><ul></ul>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/foyer_maif.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (address) {
buf.push("<h3>Membres de mon foyer:</h3><li>Adresse: &nbsp");
if ( address)
{
buf.push(jade.escape(null == (jade_interp = address.city) ? "" : jade_interp));
}
buf.push(",&nbsp");
if ( address)
{
buf.push(jade.escape(null == (jade_interp = address.country) ? "" : jade_interp));
}
buf.push("</li>");}.call(this,"address" in locals_for_with?locals_for_with.address:typeof address!=="undefined"?address:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/home_maif.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (natureLieu, nombrePieces, situationJuridiqueLieu) {
buf.push("<h3>Mon habitat assuré:</h3><li>");
if ( natureLieu)
{
buf.push(jade.escape(null == (jade_interp = natureLieu) ? "" : jade_interp));
}
buf.push("<br/></li><li>");
if ( nombrePieces)
{
buf.push(jade.escape(null == (jade_interp = nombrePieces) ? "" : jade_interp));
}
buf.push("</li><li>");
if ( situationJuridiqueLieu)
{
buf.push(jade.escape(null == (jade_interp = situationJuridiqueLieu) ? "" : jade_interp));
}
buf.push("<br/></li>");}.call(this,"natureLieu" in locals_for_with?locals_for_with.natureLieu:typeof natureLieu!=="undefined"?natureLieu:undefined,"nombrePieces" in locals_for_with?locals_for_with.nombrePieces:typeof nombrePieces!=="undefined"?nombrePieces:undefined,"situationJuridiqueLieu" in locals_for_with?locals_for_with.situationJuridiqueLieu:typeof situationJuridiqueLieu!=="undefined"?situationJuridiqueLieu:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/object_item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name, slug) {
buf.push("<div class=\"houseitem vendoritem\"><img" + (jade.attr("src", "assets/img/" + (slug) + "_logo_big.png", true, false)) + (jade.attr("title", name, true, false)) + "/></div>");}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"slug" in locals_for_with?locals_for_with.slug:typeof slug!=="undefined"?slug:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/objects.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (title) {
buf.push("<h2>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</h2><ul></ul>");}.call(this,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/phone_contact_edf.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (commercialContat, phone) {
buf.push("<h4>Numéro de contact: &nbsp");
if ( commercialContat/phone)
{
buf.push(jade.escape(null == (jade_interp = commercialContat/phone) ? "" : jade_interp));
}
buf.push("</h4>");}.call(this,"commercialContat" in locals_for_with?locals_for_with.commercialContat:typeof commercialContat!=="undefined"?commercialContat:undefined,"phone" in locals_for_with?locals_for_with.phone:typeof phone!=="undefined"?phone:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/phone_depannage_edf.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (troubleshootingPhone) {
buf.push("<h4>Plus d'info edf:<br/><br/>Numéro de dépannage: &nbsp");
if ( troubleshootingPhone)
{
buf.push(jade.escape(null == (jade_interp = troubleshootingPhone) ? "" : jade_interp));
}
buf.push("</h4>");}.call(this,"troubleshootingPhone" in locals_for_with?locals_for_with.troubleshootingPhone:typeof troubleshootingPhone!=="undefined"?troubleshootingPhone:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/sinistre_habitat.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (ref, timestamp, type) {
buf.push("<br/><button>Sinistre d'habitation</button><br/><br/><li>Type: &nbsp");
if ( type)
{
buf.push(jade.escape(null == (jade_interp = type) ? "" : jade_interp));
}
buf.push("</li><li>Date: &nbsp");
if ( timestamp)
{
buf.push(jade.escape(null == (jade_interp = timestamp) ? "" : jade_interp));
}
buf.push("</li><li>Référence: &nbsp");
if ( ref)
{
buf.push(jade.escape(null == (jade_interp = ref) ? "" : jade_interp));
}
buf.push("</li>");}.call(this,"ref" in locals_for_with?locals_for_with.ref:typeof ref!=="undefined"?ref:undefined,"timestamp" in locals_for_with?locals_for_with.timestamp:typeof timestamp!=="undefined"?timestamp:undefined,"type" in locals_for_with?locals_for_with.type:typeof type!=="undefined"?type:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/societaire_maif.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (email, name, profession, telMobile) {
buf.push("<br/><button>Societaire</button><br/><br/><li>Nom: &nbsp");
if ( name)
{
buf.push(jade.escape(null == (jade_interp = name.family) ? "" : jade_interp));
}
buf.push("&nbsp");
if ( name)
{
buf.push(jade.escape(null == (jade_interp = name.given) ? "" : jade_interp));
}
buf.push("</li><li>Profession: &nbsp");
if ( profession)
{
buf.push(jade.escape(null == (jade_interp = profession) ? "" : jade_interp));
}
buf.push("</li><li>Téléphone: &nbsp");
if ( telMobile)
{
buf.push(jade.escape(null == (jade_interp = telMobile) ? "" : jade_interp));
}
buf.push("</li><li>Email: &nbsp");
if ( email)
{
buf.push(jade.escape(null == (jade_interp = email) ? "" : jade_interp));
}
buf.push("</li>");}.call(this,"email" in locals_for_with?locals_for_with.email:typeof email!=="undefined"?email:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"profession" in locals_for_with?locals_for_with.profession:typeof profession!=="undefined"?profession:undefined,"telMobile" in locals_for_with?locals_for_with.telMobile:typeof telMobile!=="undefined"?telMobile:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/upload_file.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<h3>Ajouter un document</h3><ol><li>Choisissez un fihcier sur votre terminal :<input type=\"file\"/></li><li>Donnez un nom clair à ce fichier :<input name=\"filename\" type=\"text\" placeholder=\"notice.pdf\" class=\"form-control\"/></li><li>Vous n'avez plus qu'à l'ajouter à votre Cozy :<button name=\"addfile\" type=\"button\" class=\"btn btn-primary\">ajouter</button></li></ol>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/vendor_item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name, slug) {
buf.push("<div class=\"houseitem objectitem\"><img" + (jade.attr("src", "assets/img/" + (slug) + "_logo_big.png", true, false)) + (jade.attr("title", name, true, false)) + "/></div>");}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"slug" in locals_for_with?locals_for_with.slug:typeof slug!=="undefined"?slug:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/houseitems/vendors.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<h2>Mes fournisseurs</h2><ul></ul>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/infos_client.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (address) {
if ( address)
{
buf.push("<h3>L'adresse de mon logis</h3><div class=\"address\">" + (jade.escape(null == (jade_interp = address.formated) ? "" : jade_interp)) + "</div>");
}}.call(this,"address" in locals_for_with?locals_for_with.address:typeof address!=="undefined"?address:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/message.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (messages, undefined) {
jade_mixins["displayMessage"] = jade_interp = function(id, m){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<li" + (jade.cls([m.type], [true])) + "><span class=\"display\">" + (jade.escape(null == (jade_interp = m.label) ? "" : jade_interp)) + "</span><span" + (jade.attr("data-messageid", id, true, false)) + " class=\"close\">&nbsp;</span></li>");
};
if ( (messages.length != 0))
{
buf.push("<ul>");
// iterate messages
;(function(){
  var $$obj = messages;
  if ('number' == typeof $$obj.length) {

    for (var id = 0, $$l = $$obj.length; id < $$l; id++) {
      var message = $$obj[id];

jade_mixins["displayMessage"](id, message);
    }

  } else {
    var $$l = 0;
    for (var id in $$obj) {
      $$l++;      var message = $$obj[id];

jade_mixins["displayMessage"](id, message);
    }

  }
}).call(this);

buf.push("</ul>");
}}.call(this,"messages" in locals_for_with?locals_for_with.messages:typeof messages!=="undefined"?messages:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/mystones.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (address, natureLieu, nombrePieces, situationJuridiqueLieu) {
buf.push("<div class=\"mapcontainer\"><div id=\"map\"></div></div><div class=\"well\">");
if ( address)
{
buf.push("<div class=\"address\">" + (jade.escape(null == (jade_interp = address.street) ? "" : jade_interp)) + "&ensp;" + (jade.escape(null == (jade_interp = address.city) ? "" : jade_interp)) + "</div><div class=\"description\">" + (jade.escape(null == (jade_interp = natureLieu) ? "" : jade_interp)) + "&ensp;" + (jade.escape(null == (jade_interp = nombrePieces) ? "" : jade_interp)) + ",&ensp;" + (jade.escape(null == (jade_interp = situationJuridiqueLieu) ? "" : jade_interp)) + "</div>");
}
buf.push("</div>");}.call(this,"address" in locals_for_with?locals_for_with.address:typeof address!=="undefined"?address:undefined,"natureLieu" in locals_for_with?locals_for_with.natureLieu:typeof natureLieu!=="undefined"?natureLieu:undefined,"nombrePieces" in locals_for_with?locals_for_with.nombrePieces:typeof nombrePieces!=="undefined"?nombrePieces:undefined,"situationJuridiqueLieu" in locals_for_with?locals_for_with.situationJuridiqueLieu:typeof situationJuridiqueLieu!=="undefined"?situationJuridiqueLieu:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map