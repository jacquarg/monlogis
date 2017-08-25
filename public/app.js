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
'use-strict'

// Main application that create a Mn.Application singleton and
// exposes it.
const Router = require('router')
const AppLayout = require('views/app_layout')
const Properties = require('models/properties')

const VendorsCollection = require('collections/vendors')
// const EquipmentsCollection = require('collections/equipments')
const ObjectsCollection = require('collections/objects')


require('views/behaviors')

const Application = Mn.Application.extend({

  prepare: function () {
    this._splashMessages()
    moment.locale('fr')

    const appElem = $('[role=application]')[0]

    this.cozyDomain = appElem.dataset.cozyDomain
    cozy.client.init({
      cozyURL: `//${this.cozyDomain}`,
      token: appElem.dataset.cozyToken,
    })
    cozy.bar.init({ appName: 'Mon Logis' })

    this.properties = Properties
    this.vendors = new VendorsCollection()
    this.objects = new ObjectsCollection()
    this.konnectors = []
    return this.properties.fetch()
    .then(() => $.getJSON('/assets/data/konnectors.json'))
    .then((data) => { this.konnectors = data })
    .then(() => Promise.all([
      this._fetchAppDriveURI(),
      this.vendors.init(),
      // this.objects.fetch(),
    ]))
    .then(() => this._defineViews())
  },

  _fetchAppDriveURI: function () {
    cozy.client.fetchJSON('GET', '/apps/')
    .then((apps) => {
      this.appDriveURI = _.findWhere(apps, { _id: 'io.cozy.apps/drive' }).links.related
    })
    .catch((err) => {
      console.warn("Can't fetch drive app url. In drive links won't work.", err)
    })
  },

  prepareInBackground: function () {
  //   return Promise.resolve()
  //   .catch(err => this.trigger('message:error', err))
  },

  _splashMessages: function () {
    this.listenTo(this, 'message:display message:error',
      message => $('#splashmessage').html(message))
  },

  _defineViews: function () {
    this.trigger('message:display', "Préparation de l'application", 'defineviews')
    return Promise.all([])
    .then(() => this.trigger('message:hide', 'defineviews'))
    .catch((err) => {
      console.err(err)
      this.trigger('message:error', 'Erreur à la définition des vues.')
    })
  },

  onBeforeStart: function () {
    this.layout = new AppLayout()
    this.router = new Router()

    if (typeof Object.freeze === 'function') {
      Object.freeze(this)
    }
  },

  onStart: function () {
    this.layout.render()
    // prohibit pushState because URIs mapped from cozy-home rely on fragment
    if (Backbone.history) {
      Backbone.history.start({ pushState: false })
    }

    if (app.vendors.size() > 0) {
      app.trigger('houseitemdetails:show', app.vendors.at(0))
    } else {
      app.layout.onChildviewShowAddvendors()
    }
  },
})

const application = new Application()

module.exports = application
window.app = application

document.addEventListener('DOMContentLoaded', () => {
  application.prepare()
  .catch((err) => {
    const msg = "Erreur pendant la préparation de l'application"
    console.error(msg)
    console.error(err)
    application.trigger('message:error', msg)
  })
  .then(() => application.prepareInBackground())
  .then(() => application.start())
  .catch((err) => {
    const msg = "Erreur au lancement de l'application"
    console.error(msg)
    console.error(err)
    application.trigger('message:error', msg)
  })
})

});

;require.register("collections/accounts.js", function(exports, require, module) {
'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Model = require('models/account')

module.exports = CozyCollection.extend({
  model: Model,
})

});

;require.register("collections/bills.js", function(exports, require, module) {
'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Bill = require('models/bill')

module.exports = CozyCollection.extend({
  model: Bill,

  sort: 'date',
  initialize: function (options) {
    this.vendor = options.vendor
  },

  getFetchIndex: function () { return ['vendor', 'date'] },
  getFetchQuery: function () {
    return { selector: { vendor: this.vendor } }
  },

})

});

;require.register("collections/consumptionstatements.js", function(exports, require, module) {
'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Model = require('../models/consumptionstatement')

module.exports = CozyCollection.extend({
  model: Model,
  sort: 'end',

  getFetchIndex: function () { return ['_id', 'statementCategory'] },
  getFetchQuery: function () {
    return { selector: {
      _id: { $gte: null },
      statementCategory: { $ne: 'edelia' } }
    }
  },


  getLastPeriod: function () {
    if (this.length >= 1) {
      return this.last()
    }
  },

  getPenultimatePeriod: function () {
    if (this.length >= 2) {
      return this.at(this.length - 2)
    }
  },
})

});

;require.register("collections/equipments.js", function(exports, require, module) {
'use-strict'

const ObjetsCollection = require('./objects')

module.exports = ObjetsCollection.extend({

  getFetchQuery: () => ({ selector: { type: 'equipment' } }),

  getDummyItemAttrs: () => ({
    name: 'Mon objet',
    slug: 'newOjbect',
    type: 'object',
    folderPath: '',
  }),
})

});

;require.register("collections/files.js", function(exports, require, module) {
'use-strict'

const File = require('models/file')

module.exports = Backbone.Collection.extend({
  model: File,

  initialize: function (options) {
    this.folderPath = options.folderPath
  },

  sync: function (method, collection, options) {
    if (method !== 'read') {
      console.error('Only read is available on this collection.')
      if (options.error) {
        options.error('Only read is available on this collection.')
      }
      return
    }

    return cozy.client.files.statByPath(this.folderPath)
    .then(dir => dir.relations('contents'))
    .then(options.success, options.error)
  },
})

});

;require.register("collections/objects.js", function(exports, require, module) {
'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const AnObject = require('models/object')

module.exports = CozyCollection.extend({
  model: AnObject,

  initialize: function () {
    // this.addDummyItem()
    // this.listenTo(this, 'all', this.addDummyItem)
  },

  getDummyItemAttrs: () => ({
    name: 'Mon objet',
    slug: 'newOjbect',
    type: 'object',
    folderPath: '',
  }),

  addDummyItem: function () {
    if (this.some(el => el.isNew())) { return }

    this.add(new AnObject(this.getDummyItemAttrs()))
  },

  getFetchIndex: () => ['type'],
  getFetchQuery: () => ({ selector: { type: { $gt: 'equipment' } } }),
})

});

;require.register("collections/sinistre.js", function(exports, require, module) {
'use-strict'

const CozyCollection = require('../lib/backbone_cozycollection')
const Sinistre = require('models/sinistre')

module.exports = CozyCollection.extend({
  model: Sinistre,

  initialize: function (options) {
    this.type = options.type
  },

  getFetchIndex: function () { return ['type'] },
  getFetchQuery: function () {
    return { selector: { type: 'Habitation' } }
  },

})

});

;require.register("collections/vendors.js", function(exports, require, module) {
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
      this.accounts.filter((account) => {
        const konnector = konnectorsBySlug[account.get('account_type')]
        return konnector
          && ['isp', 'telecom', 'energy', 'insurance'].indexOf(konnector.category) !== -1
          && ['orangemobile', 'orangelivebox'].indexOf((konnector.slug)) === -1
      })
      .forEach((account) => {
        if (this.some(v => v.get('slug') === account.get('account_type'))) { return }

        const konnector = konnectorsBySlug[account.get('account_type')]
        const vendor = new Vendor({
          slug: konnector.slug,
          name: konnector.name,
          folderPath: account.has('auth') ? account.get('auth').folderPath : '',
          login: account.has('auth') ? account.get('auth').login : '',
          domain: konnector.domain,
        })

        this.add(vendor)
        vendor.save() // TODO
      })
    })
  },
})

});

;require.register("lib/appname_version.js", function(exports, require, module) {
'use-strict'

const name = 'monlogis'
// use brunch-version plugin to populate these.
const version = '0.1.4'

module.exports = `${name}-${version}`

});

;require.register("lib/async_promise.js", function(exports, require, module) {
'use-strict'

module.exports.series = function (iterable, callback, self) {
  const results = []

  return iterable.reduce((sequence, id, index, array) => {
    return sequence.then((res) => {
      results.push(res)
      return callback.call(self, id, index, array)
    })
  }, Promise.resolve(true))
  .then(res => new Promise((resolve) => { // don't handle reject there.
    results.push(res)
    resolve(results.slice(1))
  }))
}

const waitPromise = function (period) {
  return new Promise((resolve) => { // this promise always resolve :)
    setTimeout(resolve, period)
  })
}

module.exports.find = function (iterable, predicate, period) {
  const recursive = (list) => {
    const current = list.shift()
    if (current === undefined) { return Promise.resolve(undefined) }

    return predicate(current)
    .then((res) => {
      if (res === false) {
        return waitPromise(period).then(() => recursive(list))
      }

      return res
    })
  }

  return recursive(iterable.slice())
}

module.exports.backbone2Promise = function (obj, method, options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    options = $.extend(options, { success: resolve, error: reject })
    method.call(obj, options)
  })
}

});

;require.register("lib/backbone_cozycollection.js", function(exports, require, module) {
'use-strict'

module.exports = Backbone.Collection.extend({

  getFetchIndex: function () { return ['_id'] },

  getFetchQuery: function () { return { selector: { _id: { $gt: null } } } },

  sync: function (method, collection, options) {
    if (method !== 'read') {
      console.error('Only read is available on this collection.')
      if (options.error) {
        options.error('Only read is available on this collection.')
      }
      return
    }

    //eslint-disable-next-line
    const docType = new this.model().docType.toLowerCase()

    return cozy.client.data.defineIndex(docType, this.getFetchIndex())
    .then(index => cozy.client.data.query(index, this.getFetchQuery()))
    .then(options.success, options.error)
  },

})

});

;require.register("lib/backbone_cozymodel.js", function(exports, require, module) {
'use-strict'

const appName = require('../lib/appname_version')

module.exports = Backbone.Model.extend({
  docType: '',
  defaults: {
    docTypeVersion: appName,
  },

  parse: function (raw) {
    raw.id = raw._id
    return raw
  },

  sync: function (method, model, options) {
    return this.syncPromise(method, model, options)
    .then(options.success, (err) => {
      console.error(err)
      options.error(err)
    })
  },

  syncPromise: function (method, model, options) {
    if (method === 'create') {
      return cozy.client.data.create(this.docType, model.attributes)
    } else if (method === 'update') {
      // TODO !!
      return cozy.client.data.update(this.docType, model.attributes, model.attributes)
    } else if (method === 'patch') {
      // TODO !!
      return cozy.client.data.updateAttributes(this.docType, model.attributes_id, model.attributes)
    } else if (method === 'delete') {
      return cozy.client.data.delete(this.docType, model.attributes)
    } else if (method === 'read') {
      if (options.indexName && options.indexName !== '') {
        return this._fetchFirstWithSelector(options.indexName, options.index, options.selector)
      }

      return cozy.client.data.find(this.docType, model.attributes._id)
    }
  },


  _fetchFirstWithSelector: function (name, index, selector) {
    const propName = `index${name}`
    this[propName] = this[propName] || cozy.client.data.defineIndex(this.getDocType(), index)

    return this[propName]
      .then(index => cozy.client.data.query(index, { selector: selector, limit: 1 }))
      .then(res => ((res && res.length !== 0) ? res[0] : {}))
  },

  getDocType: function () {
    return Object.getPrototypeOf(this).docType
  }
})

});

;require.register("lib/backbone_cozysingleton.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('./backbone_cozymodel')

module.exports = CozyModel.extend({

  sync: function (method, model, options) {
    if (method === 'read' && model.isNew() && !options.indexName) {
      options.indexName = 'Singleton'
      options.index = ['_id']
      options.selector = { _id: { $gt: null } }
    }

    return CozyModel.prototype.sync.call(this, method, model, options)
  },
})

});

;require.register("lib/mimetype2fa.js", function(exports, require, module) {
/* eslint-disable */
var mapping = [
  // Images
  [ 'file-image-o', /^image\// ],
  // Audio
  [ 'file-audio-o', /^audio\// ],
  // Video
  [ 'file-video-o', /^video\// ],
  // Documents
  [ 'file-pdf-o', 'application/pdf' ],
  [ 'file-text-o', 'text/plain' ],
  [ 'file-code-o', [
    'text/html',
    'text/javascript'
  ] ],
  // Archives
  [ 'file-archive-o', [
    /^application\/x-(g?tar|xz|compress|bzip2|g?zip)$/,
    /^application\/x-(7z|rar|zip)-compressed$/,
    /^application\/(zip|gzip|tar)$/
  ] ],
  // Word
  [ 'file-word-o', [
    /ms-?word/,
    'application/vnd.oasis.opendocument.text',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ] ],
  // Powerpoint
  [ 'file-powerpoint-o', [
    /ms-?powerpoint/,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ] ],
  // Excel
  [ 'file-excel-o', [
    /ms-?excel/,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ] ],
  // Default, misc
  [ 'file-o' ]
]

function match (mimetype, cond) {
  if (Array.isArray(cond)) {
    return cond.reduce(function (v, c) {
      return v || match(mimetype, c)
    }, false)
  } else if (cond instanceof RegExp) {
    return cond.test(mimetype)
  } else if (cond === undefined) {
    return true
  } else {
    return mimetype === cond
  }
}

var cache = {}

function resolve (mimetype) {
  if (cache[mimetype]) {
    return cache[mimetype]
  }

  for (var i = 0; i < mapping.length; i++) {
    if (match(mimetype, mapping[i][1])) {
      cache[mimetype] = mapping[i][0]
      return mapping[i][0]
    }
  }
}

function mimetype2fa (mimetype, options) {
  if (typeof mimetype === 'object') {
    options = mimetype
    return function (mimetype) {
      return mimetype2fa(mimetype, options)
    }
  } else {
    var icon = resolve(mimetype)

    if (icon && options && options.prefix) {
      return options.prefix + icon
    } else {
      return icon
    }
  }
}

module.exports = mimetype2fa
/* eslint-disable */

});

;require.register("lib/walktree_utils.js", function(exports, require, module) {
'use_strict'

module.exports.get = function (obj, ...prop) {
  return prop.reduce((current, key) => (current ? current[key] : undefined), obj)
}

module.exports.getFirst = function (obj) {
  return obj[Object.keys(obj)[0]]
}

});

;require.register("models/account.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'io.cozy.accounts',

})

});

;require.register("models/bill.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'io.cozy.bills',

  parse: function () {
    //eslint-disable-next-line
    const attr = CozyModel.prototype.parse.apply(this, arguments)
    if (attr.vendor === 'EDF') {
      attr.amount = attr.value
    }
    return attr
  },
})

});

;require.register("models/client.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.client',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } })
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'maif' } })
  },

})

});

;require.register("models/consumptionstatement.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.consumptionstatement',

  getPeriodDuration: function () {
    return moment.duration(moment(this.get('end')) - moment(this.get('start')))
  },

  getValueAsKGSKE: function () {
    // https://www.unitjuggler.com/convertir-energy-de-kWh-en-kgSKE.html
    return get('value') * 0.12283503255128
  },
})

});

;require.register("models/contract.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.contract',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } })
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'Maif' } })
  },
})

});

;require.register("models/contract_maif.js", function(exports, require, module) {
'use-strict'

const get = require('../lib/walktree_utils').get
const CozyModel = require('../lib/backbone_cozysingleton')

module.exports = CozyModel.extend({
  docType: 'fr.maif.maifuser.contrat',

  parse: function () {
    //eslint-disable-next-line
    const attr = CozyModel.prototype.parse.apply(this, arguments)
    $.extend(attr, get(attr, 'contrat', 0))
    return attr
  },
})

});

;require.register("models/file.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'io.cozy.files',

  getFileUrl: function () {
    return cozy.client.files.getDownloadLinkById(this.get('_id'))
    .then(absolutePath => `//${app.cozyDomain}${absolutePath}`)
  },

})

});

;require.register("models/foyer.js", function(exports, require, module) {
'use-strict'

const get = require('../lib/walktree_utils').get
const CozyModel = require('../lib/backbone_cozysingleton')

module.exports = CozyModel.extend({
  docType: 'fr.maif.maifuser.foyer',

  parse: function () {
    //eslint-disable-next-line
    const attr = CozyModel.prototype.parse.apply(this, arguments)
    $.extend(attr, get(attr, 'foyer'))
    return attr
  },

})

});

;require.register("models/home.js", function(exports, require, module) {
'use-strict'

const get = require('../lib/walktree_utils').get
const CozyModel = require('../lib/backbone_cozysingleton')

module.exports = CozyModel.extend({
  docType: 'fr.maif.maifuser.home',

  parse: function () {
    //eslint-disable-next-line
    const attr = CozyModel.prototype.parse.apply(this, arguments)
    $.extend(attr, get(attr, 'home', 0))
    return attr
  },

})

});

;require.register("models/object.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')
const FileModel = require('./file')
const FilesCollection = require('collections/files')

const BASE_DIR = '/Administration/objets/'

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.object',

  defaults: $.extend(CozyModel.defaults, {
    type: 'object',
  }),

  getFolderPath: function () {
    return `${BASE_DIR}${this.get('name')}`
  },

  createDir: function () {
    if (this.has('dirID')) {
      return Promise.resolve()
    }

    return cozy.client.files.createDirectoryByPath(this.getFolderPath())
    .then(dir => this.set('dirID', dir._id))
  },

  getFiles: function () {
    if (!this.files) {
      this.files = new FilesCollection({ folderPath: this.getFolderPath() })
    }
    return this.files
  },

  setIconFileId: function (iconFileId) {
    this.set('iconFileId', iconFileId)
    this.iconFile = null
    this.iconUrl = null
  },

  getIconUrl: function () {
    if (this.iconUrl) {
      return this.iconUrl
    }

    this._fetchIcon()
    .catch((err) => {
      console.error(err)

      this.unset('iconFileId')
    })
  },

  _fetchIcon: function () {
    const iconId = this.get('iconFileId')

    if (!iconId) { return Promise.reject() }

    this.iconFile = new FileModel({ _id: iconId })
    return this.iconFile.fetch()
    .then(() => this.iconFile.getFileUrl())
    .then((fileUrl) => {
      this.iconUrl = fileUrl
      this.trigger('newIconUrl')
    })
  },
})

});

;require.register("models/paymentterms.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.paymentterms',

  fetchEDF: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'EDF', index: ['vendor'], selector: { vendor: 'EDF' } })
  },

  fetchMaif: function () {
    // TODO : check that data are coherent against one contract !
    return this.fetch({ indexName: 'Maif', index: ['vendor'], selector: { vendor: 'maif' } })
  },

  getNextPaymentEDF: function () {
    const paymentSchedules = this.get('paymentSchedules')
    if (paymentSchedules && paymentSchedules instanceof Array) {
      return _.findWhere(paymentSchedules, { paid: false })
    }
  },

  getLastPaymentEDF: function () {
    const paymentSchedules = this.get('paymentSchedules')
    if (paymentSchedules && paymentSchedules instanceof Array) {
      return paymentSchedules[_.findLastIndex(paymentSchedules, ps => ps.paid === true)]
    }
  },

})

});

;require.register("models/paymentterms_maif.js", function(exports, require, module) {
'use-strict'

const get = require('../lib/walktree_utils').get
const CozyModel = require('../lib/backbone_cozysingleton')

module.exports = CozyModel.extend({
  docType: 'fr.maif.maifuser.paymentterms',

  parse: function () {
    //eslint-disable-next-line
    const attr = CozyModel.prototype.parse.apply(this, arguments)
    $.extend(attr, get(attr, 'paymentterms'))
    return attr
  },

})

});

;require.register("models/properties.js", function(exports, require, module) {
'use-strict'

const CozySingleton = require('../lib/backbone_cozysingleton')

const Properties = CozySingleton.extend({
  docType: 'org.fing.mesinfos.monlogis.properties',
  defaults: _.extend({
    synthSets: {},
  }, CozySingleton.defaults),

  _promiseSave: function (attributes) {
    return new Promise((resolve, reject) => {
      this.save(attributes, { success: resolve, error: reject })
    })
  },

})

module.exports = new Properties()

});

;require.register("models/sinistre.js", function(exports, require, module) {
'use-strict'

const CozyModel = require('../lib/backbone_cozymodel')

module.exports = CozyModel.extend({
  docType: 'org.fing.mesinfos.insuranceclaim',
})

});

;require.register("models/vendor.js", function(exports, require, module) {
'use-strict'

const VendorBase = require('./vendor_base')
const VendorEDF = require('./vendor_edf')
const VendorMaif = require('./vendor_maif')

module.exports = function (attributes) {
  if (attributes) {
    switch (attributes.slug) {
      case 'edf': return new VendorEDF(attributes)
      case 'maif': return new VendorMaif(attributes)
      default: break
    }
  }
  return new VendorBase(attributes)
}

});

;require.register("models/vendor_base.js", function(exports, require, module) {
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

});

;require.register("models/vendor_edf.js", function(exports, require, module) {
'use-strict'

const VendorModel = require('./vendor_base')
const Client = require('./client')
const Contract = require('./contract')


module.exports = VendorModel.extend({

  toFetch: function () {
    return [
      this.getFiles().fetch(),
      this.getBills().fetch(),
      this.fetchClient(),
      this.fetchContract(),
    ]
  },


  fetchClient: function () {
    this.client = new Client()
    return this.client.fetchEDF()
  },

  fetchContract: function () {
    this.contract = new Contract()
    return this.contract.fetchEDF()
  },

  _getBillsVendor: () => 'EDF',

  _computeBudget: function () {
    const bill = this.getBills().last()
    const yearly = Number(bill.get('totalPaymentDue'))
    return {
      mensual: yearly / 12,
      daily: yearly / 12 / 30,
      annual: yearly,
    }
  },
})

});

;require.register("models/vendor_maif.js", function(exports, require, module) {
'use-strict'

const VendorModel = require('./vendor_base')

const Contract = require('./contract_maif')
const Foyer = require('./foyer')
const Home = require('./home')

module.exports = VendorModel.extend({

  toFetch: function () {
    return [
      this.getFiles().fetch(),
      this.getContract().fetch(),
      this.getFoyer().fetch(),
      this.getHome().fetch(),
    ]
  },

  getContract: function () {
    if (!this.contract) {
      this.contract = new Contract()
    }
    return this.contract
  },

  getFoyer: function () {
    if (!this.foyer) {
      this.foyer = new Foyer()
    }
    return this.foyer
  },

  getClient: function () {
    if (!this.client) {
      this.client = new Client()
    }
    return this.client
  },

  getHome: function () {
    if (!this.home) {
      this.home = new Home()
    }
    return this.home
  },

  _computeBudget: function () {
    const yearly = this.contract.get('montantTarifTtc')
    return {
      mensual: yearly / 12,
      daily: yearly / 12 / 30,
      annual: yearly,
    }
  },

})

});

;require.register("router.js", function(exports, require, module) {
'use-strict'

module.exports = Backbone.Router.extend({
  routes: {
    '': 'index',
  },
})

});

;require.register("views/add_vendors.js", function(exports, require, module) {
'use strict'

const template = require('./templates/add_vendors')

module.exports = Mn.View.extend({
  template: template,

  className: 'addvendors',

  triggers: {
    'click .close': 'close',
  },
  events: {
    'click .houseitem': 'fireIntent',
  },

  initialize: function () {
    $.getJSON('/assets/data/konnectors.json')
    .then(this._parseData.bind(this))
  },

  _parseData: function (data) {
    this.rawData = data
    // TODO use events !
    this.render()
  },

  serializeData: function () {
    const data = {}
    data.mesinfos = []
    if (this.rawData) {
      data.mesinfos.push(_.findWhere(this.rawData, { slug: 'maif' }))
      data.mesinfos.push(_.findWhere(this.rawData, { slug: 'edf' }))
      // data.mesinfos.push(_.findWhere(this.rawData, { slug: 'orangemobile' }))
      // data.mesinfos.push(_.findWhere(this.rawData, { slug: 'orangelivebox' }))
    }

    data.isp = _.where(this.rawData, { category: 'isp' })
      .filter(k => k.slug !== 'orangelivebox')
    data.telecom = _.where(this.rawData, { category: 'telecom' })
      .filter(k => k.slug !== 'orangemobile')

    return data
  },

  fireIntent: function (ev) {
    const slug = ev.currentTarget.dataset.slug
    cozy.client.intents.create('CREATE', 'io.cozy.accounts', { slug })
    .start(document.getElementById('popin'))
    .catch((err) => {
      const msg = `Erreur lors de l'activation du connecteur ${slug}`
      console.error(msg)
      console.error(err)
      app.trigger('message:error', msg)
    })
  },


  onClose: function () {
    app.trigger('houseitemdetails:close')
  },

  // onRender: function () {

  // },


})

});

;require.register("views/app_layout.js", function(exports, require, module) {
'use-strict'

const template = require('views/templates/app_layout')
const MessageView = require('views/message')
// const MystonesView = require('views/mystones')
const HouseitemDetailsEDFView = require('views/houseitems/details_edf')
const HouseitemDetailsMaifView = require('views/houseitems/details_maif')
const HouseitemDetailsVendorView = require('views/houseitems/details_vendor')
const HouseitemDetailsObjectView = require('views/houseitems/details_object')
const MenuView = require('views/menu')
// const ObjectsView = require('views/houseitems/objects')
const AddVendorsView = require('views/add_vendors')


module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',
  behaviors: {},

  regions: {
    message: '.message',
    // myStones: '.mystones',
    main: 'main',
    menu: 'aside',
    // equipments: '.equipments',
    // objects: '.objects',
  },


  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showHouseitemDetails)
    // this.listenTo(app, 'houseitemdetails:close', this._closeMain)
  },

  onRender: function () {
    this.showChildView('message', new MessageView())
    // this.showChildView('myStones', new MystonesView())
    this.showChildView('menu', new MenuView({ collection: app.vendors }))
    // this.showChildView('equipments', new ObjectsView({
    //   model: new Backbone.Model({ title: 'Mes équipements' }),
    //   collection: app.equipments,
    // }))
    // this.showChildView('objects', new ObjectsView({
    //   model: new Backbone.Model({ title: 'Mes objets' }),
    //   collection: app.objects,
    // }))
  },

  showHouseitemDetails: function (houseItem) {
    const docType = houseItem.getDocType()
    const slug = houseItem.get('slug')
    let ViewClass = null
    if (docType === 'org.fing.mesinfos.vendor') {
      if (slug === 'edf') {
        ViewClass = HouseitemDetailsEDFView
      } else if (slug === 'maif') {
        ViewClass = HouseitemDetailsMaifView
      } else {
        ViewClass = HouseitemDetailsVendorView
      }
    } else if (docType === 'org.fing.mesinfos.object') {
      const type = houseItem.get('type')
      if (type === 'object') {
        ViewClass = HouseitemDetailsObjectView
      }
    } else {
      ViewClass = HouseitemDetailsObjectView
    }

    this._showMain(new ViewClass({ model: houseItem }))
  },

  _showMain: function (view) {
    this.showChildView('main', view)

    // // TODO : something cleaner !
    // this.$('.mystones').hide()
    // this.$('.houseitems').toggleClass('col-xs-8', false)
    // this.$('.houseitems').toggleClass('col-xs-3', true)
    // this.$('Main').show()
    // this.$('Main').toggleClass('col-xs-9', true)
  },

  _closeMain: function () {
    this.getRegion('main').empty()

    // this.$('.mystones').show()
    // this.$('.houseitems').toggleClass('col-xs-8', true)
    // this.$('.houseitems').toggleClass('col-xs-3', false)
    // this.$('Main').hide()
    // this.$('Main').toggleClass('col-xs-9', false)
  },

  onChildviewShowAddvendors: function () {
    this._showMain(new AddVendorsView())
  },
})

});

;require.register("views/behaviors/destroy.js", function(exports, require, module) {
'use-strict'

module.exports = Mn.Behavior.extend({
  events: {
    'click .delete': 'destroyObject',
  },

  destroyObject: function () {
    if (this.options.onDestroy) {
      this.view[this.options.onDestroy]()
    } else {
      this.view.model.destroy()
    }
  },
})

});

;require.register("views/behaviors/index.js", function(exports, require, module) {
'use-strict'

Mn.Behaviors.behaviorsLookup = () => window.Behaviors

window.Behaviors = {
  //eslint-disable-next-line
  Toggle: require('views/behaviors/toggle'),
  //eslint-disable-next-line
  Destroy: require('views/behaviors/destroy'),
}

});

;require.register("views/behaviors/toggle.js", function(exports, require, module) {
'use-strict'

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
    this.setExpanded(true)
  },

  onContract: function () {
    this.setExpanded(false)
  },

  onToggle: function () {
    this.setExpanded(!(this.$el.attr('aria-expanded') === 'true'))
  },

  setExpanded: function (isExpanded) {
    this.$el.attr('aria-expanded', isExpanded)
  },

  onRender: function () {
    this.onContract()
  },
})

});

;require.register("views/houseitems/bill_item.js", function(exports, require, module) {
'use-strict'

const template = require('../templates/houseitems/bill_item')

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

})

});

;require.register("views/houseitems/bills.js", function(exports, require, module) {
'use strict'

const BillItemView = require('./bill_item')
const template = require('../templates/houseitems/bills')

const BillsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: BillItemView,
})

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
    this.showChildView('collection', new BillsView({ collection: this.collection }))
  },

})

});

;require.register("views/houseitems/budget.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/budget')

module.exports = Mn.View.extend({
  template: template,

  serializeData: function () {
    const data = this.model.getBudget()
    data.annualMetaphore = Math.round(data.annual / 100) // dîner gastronomique
    data.mensualMetaphore = Math.round(data.mensual / 10) // places de cinéma
    data.dailyMetaphore = Math.round(data.daily / 0.90) // croissant
    return data
  },

})

});

;require.register("views/houseitems/consomation_edf.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/consomation_edf')
const ConsumptionStatements = require('../../collections/consumptionstatements')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  // modelEvents: {
  //   change: 'render',
  // },

  //   change: 'render',
  // },
  initialize: function () {
    this.collection = new ConsumptionStatements()
    this.listenTo(this.collection, 'add', this.render)
    this.collection.fetch()
  },

  serializeData: function () {
    const lastPeriod = this.collection.getLastPeriod()
    const penultimatePeriod = this.collection.getPenultimatePeriod()
    const data = {}
    if (lastPeriod) {
      data.lastPeriod = lastPeriod.toJSON()
      data.lastPeriod.duration = lastPeriod.getPeriodDuration()
    }
    if (penultimatePeriod) {
      data.penultimatePeriod = penultimatePeriod.toJSON()
      data.penultimatePeriod.duration = penultimatePeriod.getPeriodDuration()
      const increase = lastPeriod.get('value') - penultimatePeriod.get('value')
      if (increase < 0) {
        data.increase = increase / lastPeriod.get('value')
      }
    }
    return data
  },

})

});

;require.register("views/houseitems/details_edf.js", function(exports, require, module) {
'use strict'

const DetailsVendorView = require('./details_vendor')
const template = require('../templates/houseitems/details_edf')
const ConsomationView = require('./consomation_edf')
const PaymenttermsView = require('./paymentterms')


module.exports = DetailsVendorView.extend({
  template: template,

  regions: {
    budget: '.budget',
    consomation: '.consumption',
    paymentterms: '.paymentterms',
    files: '.files',
  },

  serializeData: function () {
    //eslint-disable-next-line
    const data = DetailsVendorView.prototype.serializeData.apply(this, arguments)
    if (this.model.client) {
      data.client = this.model.client.toJSON()
    }
    if (this.model.contract) {
      data.contract = this.model.contract.toJSON()
    }
    // data.appURI = $("#coz-bar a[href*='maif.']").attr('href')
    return data
  },

  onRender: function () {
    //eslint-disable-next-line
    DetailsVendorView.prototype.onRender.apply(this, arguments)
    this.showChildView('consomation', new ConsomationView())
    this.showChildView('paymentterms', new PaymenttermsView({ vendor: 'edf' }))
  },

})

});

;require.register("views/houseitems/details_maif.js", function(exports, require, module) {
'use strict'

const DetailsVendorView = require('./details_vendor')
const template = require('../templates/houseitems/details_maif')
const PaymenttermsView = require('./paymentterms')
// const SocietaireView = require('./societaire_maif')
const FoyerView = require('./foyer_maif')
const HomeView = require('./home_maif')
// const SinistreView = require('./sinistre')
// const SinistreCollection = require('collections/sinistre')

module.exports = DetailsVendorView.extend({
  template: template,
  className: 'maif',
  regions: {
    files: '.files',
    budget: '.budget',
    sinistres: '.sinistres',
    paymentterms: '.paymentterms',
    foyer: '.foyer',
    home: '.home',
  },

  serializeData: function () {
    const data = this.model.toJSON()
    data.contract = this.model.getContract().toJSON()
    // data.appURI = $("#coz-bar a[href*='maif.']").attr('href')
    return data
  },

  onRender: function () {
    //eslint-disable-next-line
    DetailsVendorView.prototype.onRender.apply(this, arguments)
    this.showChildView('paymentterms', new PaymenttermsView({ vendor: 'maif', contract: this.model.getContract() }))
    this.showChildView('foyer', new FoyerView({ model: this.model.getFoyer() }))
    this.showChildView('home', new HomeView({ model: this.model.getHome() }))

    // this.showChildView('sinistres', new SinistreView({
    //   model: new Backbone.Model({ slug: 'Maif' }),
    //   collection: this.sinistres,
    // }))
    // this.showChildView('societaireMaif', new SocietaireView())
  },
})

});

;require.register("views/houseitems/details_object.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/details_object')
const FilesView = require('./files')

module.exports = Mn.View.extend({
  template: template,
  className: 'object',
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

  triggers: {
    'click .close': 'close',
  },

  modelEvents: {
    change: 'render',
    newIconUrl: 'render',

  },

  regions: {
    files: '.files',

  },

  initialize: function () {
    this.model.getFiles().fetch()
  },

  serializeData: function () {
    const data = this.model.toJSON()
    data.iconUrl = this.model.getIconUrl()
    return data
  },

  onRender: function () {
    this.showChildView('files', new FilesView({ model: this.model, }))
  },

  onFormChange: function () {
    this.model.save({
      name: this.ui.inputName.val(),
      description: this.ui.inputDescription.val(),
    })
  },

  onClose: function () {
    app.trigger('houseitemdetails:close')
  },

  // displayIcon: function (iconFile) {
  //   iconFile.getFileUrl().then((url) => {
  //     this.iconUrl = url
  //     this.ui.icon.attr('src', url)
  //   })
  // },

  changeIcon: function () {
    const files = this.model.getFiltes()
    //eslint-disable-next-line
    const imgFiles = files.filter(file => file.has('attributes') && file.get('attributes')['class'] === 'image')

    if (imgFiles.length === 0) { return }

    const iconFileId = this.model.get('iconFileId')
    let iconFile = null
    let index = 0
    if (iconFileId) {
      iconFile = files.get(iconFileId)
      index = imgFiles.indexOf(iconFile)
      index = (index + 1) % imgFiles.length
    }

    iconFile = imgFiles[index]

    this.model.setIconFileId(iconFile.get('_id'))
    this.model.save()
  },

})

});

;require.register("views/houseitems/details_vendor.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/details_vendor')
const FilesView = require('./files')
const BudgetView = require('./budget')

module.exports = Mn.View.extend({
  template: template,
  className: 'row',

  triggers: {
    'click .close': 'close',
  },

  modelEvents: {
    fetchedall: 'render',
  },

  regions: {
    files: '.files',
    budget: '.budget',
  },

  initialize: function () {
    this.model.fetchAll()
  },

  onRender: function () {
    this.showChildView('files', new FilesView({ model: this.model }))
    this.showChildView('budget', new BudgetView({ model: this.model }))
  },
})

});

;require.register("views/houseitems/file_item.js", function(exports, require, module) {
'use-strict'

const template = require('../templates/houseitems/file_item')
const mimetype2FA = require('lib/mimetype2fa')({ prefix: 'fa-' })

module.exports = Mn.View.extend({
  template: template,
  tagName: 'li',

  events: {
    click: 'openFile',
  },

  modelEvents: {
    change: 'render',
  },

  serializeData: function () {
    const data = this.model.toJSON()
    if (this.model.bill) {
      data.bill = this.model.bill.toJSON()
      data.bill.date = data.bill.date.slice(0, 10)
    }
    if (data.attributes && data.attributes.mime) {
      data.faClass = mimetype2FA(data.attributes.mime)
    }
    return data
  },


  openFile: function () {
    this.model.getFileUrl()
    .then((url) => {
      const link = document.createElement('a')
      link.href = url
      link.download = this.model.get('name')
      document.body.appendChild(link)
      link.click()
    })
  },

})

});

;require.register("views/houseitems/files.js", function(exports, require, module) {
'use strict'

const UploadFile = require('./upload_file')

const FileItemView = require('./file_item')
const template = require('../templates/houseitems/files')

const FilesView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: FileItemView,
})

module.exports = Mn.View.extend({
  // className: 'row',
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
    addFile: '.addfile',
  },

  modelEvents: {
    newFile: 'updateFilesCollection',
  },

  initialize: function () {
    this.collection = this.model.getFiles()
    this.model.injectBillsInFiles()
  },

  updateFilesCollection: function (file) {
    this.collection.add(file)
  },

  serializeData: function () {
    const data = this.model.toJSON()
    data.folderInFilesURI = `${app.appDriveURI}#/files/${this.model.getDirID()}`

    return data
  },

  onRender: function () {
    this.showChildView('collection', new FilesView({ collection: this.collection }))
    this.showChildView('addFile', new UploadFile({ model: this.model }))
  },
})

});

;require.register("views/houseitems/foyer_maif.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/foyer_maif')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  initialize: function () {
  },

  // getFoyerMaif: function () {
  //   const membres = this.get('membres')
  //   if (membres && membres instanceof Array) {
  //     //eslint-disable-next-line
  //     for (const value of membres) {
  //       return `${value.name.prefix} ${value.name.family}  ${value.name.given}`
  //     }
  //   }
  // },


  // serializeData: function () {
  //   const data = this.model.toJSON()
  //   data.foyerMaif = this.model.getFoyerMaif()
  //   return data
  // },

})

});

;require.register("views/houseitems/home_maif.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/home_maif')

module.exports = Mn.View.extend({
  template: template,

})

});

;require.register("views/houseitems/object_item.js", function(exports, require, module) {
'use-strict'

const template = require('../templates/houseitems/object_item')

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
    newIconUrl: 'render',
  },

  serializeData: function () {
    const data = this.model.toJSON()
    data.iconUrl = this.model.getIconUrl()
    if (!data.iconUrl) {
      data.iconUrl = '/assets/img/gift_icon.png'
    }
    return data
  },

  onRender: function () {
    // this.ui.icon.on('error', (ev) => {
    //   ev.target.src = 'assets/img/gift_icon.png'
    // })
  },

  showDetails: function () {
    app.trigger('houseitemdetails:show', this.model)
  },

})

});

;require.register("views/houseitems/objects.js", function(exports, require, module) {
'use strict'

const ObjectItemView = require('./object_item')
const template = require('../templates/houseitems/objects')

const ObjectModel = require('models/object')

const ObjectsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: ObjectItemView,
})

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

  triggers: {
    'click .add': 'show:newobject',
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('collection', new ObjectsView({ collection: this.collection }))
    // this.showChildView('newItem', new ObjectItemView({ model: new this.collection.model()}))
  },

  onShowNewobject: function () {
    app.trigger('houseitemdetails:show', new ObjectModel())
  },
})

});

;require.register("views/houseitems/paymentterms.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/paymentterms')
const Paymentterms = require('../../models/paymentterms')
const PaymenttermsMaif = require('../../models/paymentterms_maif')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function (options) {
    this.vendor = options.vendor
    if (this.vendor === 'edf') {
      this.model = new Paymentterms()
      this.model.fetchEDF()
    } else if (this.vendor === 'maif') {
      this.model = new PaymenttermsMaif()
      this.model.fetch()
      this.contract = options.contract
    }
  },

  serializeData: function () {
    const data = this.model.toJSON()
    if (this.vendor === 'edf') {
      data.nextPaymentAmount = this.model.getNextPaymentEDF()
      data.lastPaymentAmount = this.model.getLastPaymentEDF()
    }

    if (this.vendor === 'maif') {
      data.annualCost = this.contract.get('montantTarifTtc')
    }
    return data
  },

})

});

;require.register("views/houseitems/sinistre.js", function(exports, require, module) {
'use strict'

const SinistreItemView = require('./sinistre_item')
const template = require('../templates/houseitems/sinistre')

const SinistreView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: 'movielibrary',
  childView: SinistreItemView,
})

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
    this.showChildView('collection', new SinistreView({ collection: this.collection }))
  },

})

});

;require.register("views/houseitems/sinistre_item.js", function(exports, require, module) {
'use-strict'

const template = require('../templates/houseitems/sinistre_item')

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

})

});

;require.register("views/houseitems/societaire_maif.js", function(exports, require, module) {
'use strict'

const template = require('../templates/houseitems/societaire_maif')
const SocietaireMaif = require('../../models/client')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new SocietaireMaif()
    this.model.fetchMaif()
  },

})

});

;require.register("views/houseitems/upload_file.js", function(exports, require, module) {
'use-strict'

const template = require('../templates/houseitems/upload_file')
const get = require('../../lib/walktree_utils').get

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
      const name = get(this.ui.inputFile, 0, 'files', 0, 'name')
      this.ui.inputFileName.val(name)
    }
  },

  uploadFile: function () {
    const file = get(this.ui.inputFile, 0, 'files', 0)
    const name = this.ui.inputFileName.val()

    if (file && name !== null) {
      app.trigger('message:display', 'Création du répertoire en cours ...', 'upload_file')
      this.model.createDir()
      .then(() => app.trigger('message:display', 'Téléversement du fichier en cours ...', 'upload_file'))
      .then(() => cozy.client.files.create(file, { name: name, dirID: this.model.getDirID() }))
      .then((file) => {
        app.trigger('message:hide', 'upload_file')
        this.model.trigger('newFile', file)
      })
      .catch((err) => {
        app.trigger('message:hide', 'upload_file')
        app.trigger('message:error', 'Erreur lors du téléversement du fichier.')
        console.error(err)
      })
    } else {
      app.trigger('message:error', 'Fichier invalide, ou nom incomplet.')
    }
  },
})

});

;require.register("views/infos_client.js", function(exports, require, module) {
'use strict'

const template = require('./templates/infos_client')
const Client = require('../models/client')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Client()
    this.model.fetch()
  },

  // onRender: function () {

  // },


})

});

;require.register("views/menu.js", function(exports, require, module) {
'use strict'

const VendorItemView = require('./vendor_item')
const template = require('./templates/menu')
const nameVersion = require('lib/appname_version')

const VendorsView = Mn.CollectionView.extend({
  tagName: 'ul',
  // className: '',
  childView: VendorItemView,

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showSelected)
  },

  showSelected: function (houseItem) {
    this.$('li').toggleClass('selected', false)
    const item = this.children.findByModel(houseItem)
    item.$el.toggleClass('selected', true)
  },

})

module.exports = Mn.View.extend({
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  triggers: {
    'click .add': 'show:addvendors',
  },

  serializeData: function () {
    //eslint-disable-next-line
    const data = Mn.View.prototype.serializeData.call(arguments)
    data.nameVersion = nameVersion
    return data
  },

  onRender: function () {
    this.showChildView('collection', new VendorsView({ collection: this.collection }))
  },
})

});

;require.register("views/message.js", function(exports, require, module) {
'use-strict'

const template = require('views/templates/message')

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
    this.messages = {}
    this.listenTo(app, 'message:display', this.onDisplay)
    this.listenTo(app, 'message:hide', this.onHide)
    this.listenTo(app, 'message:error', this.onError)
  },

  serializeData: function () {
    return { messages: this.messages }
  },

  onError: function (message) {
    this.display({
      label: message.toString(),
      type: 'error',
      message: message,
    }, Math.ceil(Math.random() * 10000))
    console.error(`Emsg: ${message}`)
  },

  onDisplay: function (message, id) {
    this.display({
      type: 'info',
      label: message.toString(),
      message: message,
    }, id)
  },

  display: function (message, id) {
    this.messages[id] = message
    this.render()
  },

  onClose: function (ev) {
    this.onHide(ev.currentTarget.dataset.messageid)
  },

  onHide: function (id) {
    delete this.messages[id]
    this.render()
  },
})

});

;require.register("views/mystones.js", function(exports, require, module) {
'use strict'

const template = require('./templates/mystones')
const Home = require('../models/home')

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  modelEvents: {
    change: 'render',
  },

  initialize: function () {
    this.model = new Home()
    this.model.fetch()
  },

  onBeforeRender: function () {
    console.log('here')
    console.log(this.model.toJSON())
  },

  geocode: function () {
    const address = this.model.get('address')
    address.formated = `${address.street}+${address.city}+${address.country}`
    return $.get(`//nominatim.openstreetmap.org/search?format=json&q=${address.formated}`)
    .then((res) => {
      console.log(res)
      address.point = res[0]
      return address.point
    })
  },

  onRender: function () {
    if (this.model.isNew()) { return }
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
      })

      osmb.appendTo('map')

      osmb.addMapTiles('https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
        {
          attribution: '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
        })

      osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json')
      osmb.highlight(point.osm_id, '#f08000')
      osmb.highlight(point.place_id, '#f08000')
    })
  }

})

});

;require.register("views/templates/add_vendors.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (isp, mesinfos, name, telecom, undefined) {
jade_mixins["vendor"] = jade_interp = function(slug){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<li" + (jade.attr("data-slug", slug, true, false)) + " class=\"img-thumbnail houseitem objectitem\"><img" + (jade.attr("src", "assets/img/icon_konnectors/" + (slug) + ".svg", true, false)) + (jade.attr("title", name, true, false)) + "/></li>");
};
buf.push("<div class=\"col-xs-12\"><h2>Sélectionnez vos fournisseurs, puis configurez la collect automatique de données (factures, ...)</h2></div><div class=\"col-xs-12 frame\"><div class=\"row\"><div class=\"col-xs-12 category mesinfos\"><h3>Fournisseurs&ensp;<b>partenaires MesInfos</b></h3><ul>");
// iterate mesinfos
;(function(){
  var $$obj = mesinfos;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var v = $$obj[$index];

jade_mixins["vendor"](v.slug);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var v = $$obj[$index];

jade_mixins["vendor"](v.slug);
    }

  }
}).call(this);

buf.push("</ul><div class=\"end\"></div></div><div class=\"col-xs-12 category isp\"><h3>Fournisseurs&ensp;<b>Internet</b></h3><ul>");
// iterate isp
;(function(){
  var $$obj = isp;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var v = $$obj[$index];

jade_mixins["vendor"](v.slug);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var v = $$obj[$index];

jade_mixins["vendor"](v.slug);
    }

  }
}).call(this);

buf.push("</ul><div class=\"end\"></div></div><div class=\"col-xs-12 category telecom\"><h3>Fournisseurs&ensp;<b>Télécom</b></h3><ul>");
// iterate telecom
;(function(){
  var $$obj = telecom;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var v = $$obj[$index];

jade_mixins["vendor"](v.slug);
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var v = $$obj[$index];

jade_mixins["vendor"](v.slug);
    }

  }
}).call(this);

buf.push("</ul><div class=\"end\"></div></div></div></div>");}.call(this,"isp" in locals_for_with?locals_for_with.isp:typeof isp!=="undefined"?isp:undefined,"mesinfos" in locals_for_with?locals_for_with.mesinfos:typeof mesinfos!=="undefined"?mesinfos:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"telecom" in locals_for_with?locals_for_with.telecom:typeof telecom!=="undefined"?telecom:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
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

;require.register("views/templates/app_layout.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<aside class=\"houseitems\"><div class=\"vendors\"></div><div class=\"objects\"></div></aside><main class=\"houseitemdetails container-fluid\"></main><div class=\"message\"></div><div id=\"popin\"></div>");;return buf.join("");
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

;return buf.join("");
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

;require.register("views/templates/houseitems/budget.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (annual, annualMetaphore, daily, dailyMetaphore, mensual, mensualMetaphore) {
jade_mixins["period"] = jade_interp = function(value, unit, metaphoreCount, metaphoreLabel, metaphoreImg){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<span class=\"text1\"><span class=\"value\">" + (jade.escape(null == (jade_interp = value.toFixed(2)) ? "" : jade_interp)) + "</span><span class=\"unit\">" + (jade.escape(null == (jade_interp = unit) ? "" : jade_interp)) + "</span></span><span class=\"equal\">=</span><span class=\"metaphore\">");
var n = 0;
while (n < metaphoreCount)
{
buf.push("<img" + (jade.attr("src", metaphoreImg, true, false)) + "/>");
n++
}
buf.push("<div class=\"metaphoreLabel\">" + (jade.escape(null == (jade_interp = metaphoreCount) ? "" : jade_interp)) + (jade.escape(null == (jade_interp = metaphoreLabel) ? "" : jade_interp)) + "</div></span>");
};
buf.push("<h3><i class=\"fa fa-eur\"></i>Budget\n&emsp;-&emsp;\nVos dépenses&ensp;représentent :</h3><div class=\"row\"><div class=\"col-md-5 illustration\"><img src=\"/assets/img/illustrations/ON40SD0.jpg\"/></div><div class=\"col-md-7 budgetlines\">");
if ( daily)
{
buf.push("<div class=\"budgetline daily\">");
jade_mixins["period"](daily, "€/jour ", dailyMetaphore, " croissants", "/assets/img/croissant.svg");
buf.push("</div>");
}
if ( mensual)
{
buf.push("<div class=\"budgetline mensual\">");
jade_mixins["period"](mensual, "€/mois ", mensualMetaphore, " places de cinéma", "/assets/img/cinematicket.svg");
buf.push("</div>");
}
if ( annual)
{
buf.push("<div class=\"budgetline annual\">");
jade_mixins["period"](annual, "€/an ", annualMetaphore, " dîners gastronomiques", "/assets/img/toque.svg");
buf.push("</div>");
}
buf.push("</div></div>");}.call(this,"annual" in locals_for_with?locals_for_with.annual:typeof annual!=="undefined"?annual:undefined,"annualMetaphore" in locals_for_with?locals_for_with.annualMetaphore:typeof annualMetaphore!=="undefined"?annualMetaphore:undefined,"daily" in locals_for_with?locals_for_with.daily:typeof daily!=="undefined"?daily:undefined,"dailyMetaphore" in locals_for_with?locals_for_with.dailyMetaphore:typeof dailyMetaphore!=="undefined"?dailyMetaphore:undefined,"mensual" in locals_for_with?locals_for_with.mensual:typeof mensual!=="undefined"?mensual:undefined,"mensualMetaphore" in locals_for_with?locals_for_with.mensualMetaphore:typeof mensualMetaphore!=="undefined"?mensualMetaphore:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (lastPeriod, penultimatePeriod) {
buf.push("<h3><i class=\"fa fa-lightbulb-o\"></i>Consommation</h3>");
if ( lastPeriod)
{
buf.push("<div class=\"lastPeriod\"><span class=\"labelperiod top\">Les&ensp;" + (jade.escape(null == (jade_interp = lastPeriod.duration.humanize()) ? "" : jade_interp)) + "&ensp;derniers,</span><span class=\"labelconsumption bottomleft\">j'ai consommé</span><span class=\"value bottomright\">" + (jade.escape(null == (jade_interp = lastPeriod.value) ? "" : jade_interp)) + "kWh</span></div>");
}
if ( penultimatePeriod)
{
buf.push("<div class=\"penultimatePeriod\"><span class=\"labelperiod top\">Les&ensp;" + (jade.escape(null == (jade_interp = penultimatePeriod.duration.humanize()) ? "" : jade_interp)) + "&ensp; précédents,</span><span class=\"labelconsumption bottomleft\">j'avais consommé</span><span class=\"value bottomright\">" + (jade.escape(null == (jade_interp = penultimatePeriod.value) ? "" : jade_interp)) + "kWh</span></div>");
}}.call(this,"lastPeriod" in locals_for_with?locals_for_with.lastPeriod:typeof lastPeriod!=="undefined"?lastPeriod:undefined,"penultimatePeriod" in locals_for_with?locals_for_with.penultimatePeriod:typeof penultimatePeriod!=="undefined"?penultimatePeriod:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (category, client, contract, login, name, slug) {
buf.push("<div class=\"col-xs-12\"><h2>Mon fournisseur&ensp;" + (jade.escape(null == (jade_interp = category) ? "" : jade_interp)) + "&ensp;<img" + (jade.attr("src", "/assets/img/icon_konnectors/" + (slug) + ".svg", true, false)) + " class=\"icon\"/></h2></div><div class=\"col-xs-12 frame\"><div class=\"row\"><div class=\"col-lg-8 paymentterms\"></div><div class=\"col-lg-4 consumption\"></div></div><div class=\"row\"><div class=\"col-xs-12 budget\"></div></div><div class=\"row\"><div class=\"col-lg-8 files\"></div><div class=\"col-lg-4 relation\"><h3><i class=\"fa fa-handshake-o\"></i>Ma relation avec&ensp;" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "</h3><div class=\"contract\">");
if ( contract)
{
buf.push("<ul><li><span class=\"label\">Contrat&nbsp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = contract.name) ? "" : jade_interp)) + "&ensp;" + (jade.escape(null == (jade_interp = contract.contractSubcategory1) ? "" : jade_interp)) + "</span></li><li><span class=\"label\">Puissance :&ensp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = contract.power) ? "" : jade_interp)) + "</span></li></ul>");
}
buf.push("</div><div class=\"identifiers\"><h4>Mes identifiants :</h4><ul>");
if ( login)
{
buf.push("<li><span class=\"label\">login web :&ensp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = login) ? "" : jade_interp)) + "</span></li>");
}
buf.push("<li><span class=\"label\">Point De Livraison :&ensp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = contract.pdl) ? "" : jade_interp)) + "</span></li></ul></div><div class=\"contact\"><h4>Contacter EDF</h4><div class=\"phoneTroubleshooting\">");
if ( contract)
{
buf.push("<img src=\"/assets/img/tell.svg\" class=\"img_tell\"/><span>dépannage :&nbsp</span><span>" + (jade.escape(null == (jade_interp = contract.troubleshootingPhone) ? "" : jade_interp)) + "</span>");
}
buf.push("</div><div class=\"phoneContact\">");
if ( (client && client.commercialContact))
{
buf.push("<img src=\"/assets/img/tell.svg\" class=\"img_tell\"/><span>service client :&nbsp</span><span>" + (jade.escape(null == (jade_interp = client.commercialContact.phone) ? "" : jade_interp)) + "</span>");
}
buf.push("</div></div></div></div></div>");}.call(this,"category" in locals_for_with?locals_for_with.category:typeof category!=="undefined"?category:undefined,"client" in locals_for_with?locals_for_with.client:typeof client!=="undefined"?client:undefined,"contract" in locals_for_with?locals_for_with.contract:typeof contract!=="undefined"?contract:undefined,"login" in locals_for_with?locals_for_with.login:typeof login!=="undefined"?login:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"slug" in locals_for_with?locals_for_with.slug:typeof slug!=="undefined"?slug:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (category, contract, login, name, slug) {
buf.push("<div class=\"col-xs-12\"><h2>Mon fournisseur&ensp;" + (jade.escape(null == (jade_interp = category) ? "" : jade_interp)) + "&ensp;<img" + (jade.attr("src", "/assets/img/icon_konnectors/" + (slug) + ".svg", true, false)) + " class=\"icon\"/></h2></div><div class=\"col-xs-12 frame\"><div class=\"row\"><div class=\"col-lg-4 paymentterms\"></div><div class=\"col-lg-4 col-sm-6 foyer\"></div><div class=\"col-lg-4 col-sm-6 home\"></div></div><div class=\"row\"><div class=\"col-xs-12 budget\"></div></div><div class=\"row\"><div class=\"col-lg-8 files\"></div><div class=\"col-lg-4 relation\"><h3><i class=\"fa fa-handshake-o\"></i>Ma relation avec&ensp;" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "\n</h3><div class=\"contract\">");
if ( contract)
{
buf.push("<ul><li><span class=\"label\">Contrat&nbsp</span><span class=\"value\">" + (jade.escape(null == (jade_interp = contract.name) ? "" : jade_interp)) + "</span></li><li>");
if ( contract.startDate)
{
buf.push("<span class=\"label\">Début de contrat&nbsp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = contract.startDate.slice(0, 10)) ? "" : jade_interp)) + "</span>");
}
buf.push("</li></ul>");
}
buf.push("</div><div class=\"identifiers\"><h4>Mes identifiants :</h4><ul>");
if ( login)
{
buf.push("<li><span class=\"label\">login web :&ensp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = login) ? "" : jade_interp)) + "</span></li>");
}
if ( contract)
{
buf.push("<li><span class=\"label\">Numéro de sociétaire :&ensp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = contract.societaire) ? "" : jade_interp)) + "</span></li>");
}
buf.push("</ul></div><div class=\"contact\"><h4>Contacter la Maif</h4><div><img src=\"/assets/img/tell.svg\"/><span>&nbsp;09 72 72 15 15</span></div></div></div></div></div>");}.call(this,"category" in locals_for_with?locals_for_with.category:typeof category!=="undefined"?category:undefined,"contract" in locals_for_with?locals_for_with.contract:typeof contract!=="undefined"?contract:undefined,"login" in locals_for_with?locals_for_with.login:typeof login!=="undefined"?login:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"slug" in locals_for_with?locals_for_with.slug:typeof slug!=="undefined"?slug:undefined));;return buf.join("");
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
buf.push("<div class=\"columnbody col-xs-8\"><div class=\"files\"></div></div><div class=\"columnright col-xs-4\"><img" + (jade.attr("src", iconUrl, true, false)) + " class=\"objecticon img-thumbnail\"/><button id=\"changeicon\" type=\"button\" class=\"btn btn-default btn-xs\">modifier l'icône</button><input name=\"name\" type=\"text\" placeholder=\"Nom de l'objet\"" + (jade.attr("value", name, true, false)) + " class=\"form-control\"/><textarea name=\"description\" rows=\"3\" placeholder=\"Description\" class=\"form-control\">" + (jade.escape(null == (jade_interp = description) ? "" : jade_interp)) + "</textarea></div><div class=\"close\">x</div>");}.call(this,"description" in locals_for_with?locals_for_with.description:typeof description!=="undefined"?description:undefined,"iconUrl" in locals_for_with?locals_for_with.iconUrl:typeof iconUrl!=="undefined"?iconUrl:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (category, login, name, slug) {
buf.push("<div class=\"col-xs-12\"><h2>Mon fournisseur&ensp;" + (jade.escape(null == (jade_interp = category) ? "" : jade_interp)) + "&ensp;<img" + (jade.attr("src", "/assets/img/icon_konnectors/" + (slug) + ".svg", true, false)) + " class=\"icon\"/></h2></div><div class=\"col-xs-12 frame\"><div class=\"row\"><div class=\"col-xs-12 budget\"></div></div><div class=\"row\"><div class=\"col-lg-8 files\"></div><div class=\"col-lg-4 relation\"><h3><i class=\"fa fa-handshake-o\"></i>Ma relation avec&ensp;" + (jade.escape(null == (jade_interp = name) ? "" : jade_interp)) + "</h3><div class=\"contract\"></div><div class=\"identifiers\"><h4>Mes identifiants :</h4><ul>");
if ( login)
{
buf.push("<li><span class=\"label\">login web :&ensp;</span><span class=\"value\">" + (jade.escape(null == (jade_interp = login) ? "" : jade_interp)) + "</span></li>");
}
buf.push("</ul></div></div></div></div>");}.call(this,"category" in locals_for_with?locals_for_with.category:typeof category!=="undefined"?category:undefined,"login" in locals_for_with?locals_for_with.login:typeof login!=="undefined"?login:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"slug" in locals_for_with?locals_for_with.slug:typeof slug!=="undefined"?slug:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (attributes, bill, faClass) {
if ( faClass)
{
buf.push("<i" + (jade.cls(["fa " +faClass], [true])) + "></i>");
}
if ( attributes)
{
buf.push(jade.escape(null == (jade_interp = attributes.name) ? "" : jade_interp));
}
if ( bill)
{
buf.push("<span class=\"bill\">Facture de&ensp;" + (jade.escape(null == (jade_interp = bill.amount) ? "" : jade_interp)) + "€ le&ensp;" + (jade.escape(null == (jade_interp = bill.date) ? "" : jade_interp)) + "</span>");
}}.call(this,"attributes" in locals_for_with?locals_for_with.attributes:typeof attributes!=="undefined"?attributes:undefined,"bill" in locals_for_with?locals_for_with.bill:typeof bill!=="undefined"?bill:undefined,"faClass" in locals_for_with?locals_for_with.faClass:typeof faClass!=="undefined"?faClass:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (folderInFilesURI) {
buf.push("<h3><i class=\"fa fa-file-o\"></i>Documents<a" + (jade.attr("href", folderInFilesURI, true, false)) + " target=\"_blank\">ouvrir dans drive<i class=\"fa fa-external-link\"></i></a></h3><div class=\"addfile\"></div><ul></ul>");}.call(this,"folderInFilesURI" in locals_for_with?locals_for_with.folderInFilesURI:typeof folderInFilesURI!=="undefined"?folderInFilesURI:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (membres, undefined) {
buf.push("<h3><i class=\"fa fa-users\"></i>Membres de foyer</h3>");
if ( membres)
{
buf.push("<ul>");
// iterate membres
;(function(){
  var $$obj = membres;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var value = $$obj[$index];

if ( value.name)
{
buf.push("<li><div class=\"name\"><span class=\"namegiven\">" + (jade.escape(null == (jade_interp = value.name.given.toLowerCase()) ? "" : jade_interp)) + "</span>&ensp;<span class=\"namefamily\">" + (jade.escape(null == (jade_interp = value.name.family) ? "" : jade_interp)) + "</span></div></li>");
}
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var value = $$obj[$index];

if ( value.name)
{
buf.push("<li><div class=\"name\"><span class=\"namegiven\">" + (jade.escape(null == (jade_interp = value.name.given.toLowerCase()) ? "" : jade_interp)) + "</span>&ensp;<span class=\"namefamily\">" + (jade.escape(null == (jade_interp = value.name.family) ? "" : jade_interp)) + "</span></div></li>");
}
    }

  }
}).call(this);

buf.push("</ul>");
}}.call(this,"membres" in locals_for_with?locals_for_with.membres:typeof membres!=="undefined"?membres:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
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
buf.push("<h3><i class=\"fa fa-home\"></i>Mon habitat assuré</h3><ul class=\"details\"><li>" + (jade.escape(null == (jade_interp = natureLieu) ? "" : jade_interp)) + "</li><li>" + (jade.escape(null == (jade_interp = nombrePieces) ? "" : jade_interp)) + "</li><li>" + (jade.escape(null == (jade_interp = situationJuridiqueLieu) ? "" : jade_interp)) + "</li></ul>");}.call(this,"natureLieu" in locals_for_with?locals_for_with.natureLieu:typeof natureLieu!=="undefined"?natureLieu:undefined,"nombrePieces" in locals_for_with?locals_for_with.nombrePieces:typeof nombrePieces!=="undefined"?nombrePieces:undefined,"situationJuridiqueLieu" in locals_for_with?locals_for_with.situationJuridiqueLieu:typeof situationJuridiqueLieu!=="undefined"?situationJuridiqueLieu:undefined));;return buf.join("");
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
;var locals_for_with = (locals || {});(function (iconUrl, name) {
buf.push("<div class=\"houseitem img-thumbnail\"><img" + (jade.attr("src", iconUrl, true, false)) + (jade.attr("title", name, true, false)) + "/></div>");}.call(this,"iconUrl" in locals_for_with?locals_for_with.iconUrl:typeof iconUrl!=="undefined"?iconUrl:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
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
buf.push("<h2>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "&emsp;<button class=\"btn btn-default btn-sm add\">ajouter</button></h2><ul></ul>");}.call(this,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
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

;require.register("views/templates/houseitems/paymentterms.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (annualCost, lastPaymentAmount, modePaiement, nextPaymentAmount) {
buf.push("<h3><i class=\"fa fa-money\"></i>Paiements</h3>");
if ( annualCost)
{
buf.push("<div class=\"annualPayment\"><span class=\"labelamount\">Je paie&nbsp</span><span class=\"amount\">" + (jade.escape(null == (jade_interp = annualCost) ? "" : jade_interp)) + "€</span><span class=\"mode\">" + (jade.escape(null == (jade_interp = modePaiement) ? "" : jade_interp)) + "</span><span class=\"date\">par an.</span></div>");
}
if ( nextPaymentAmount)
{
buf.push("<div class=\"nextpayment\"><img src=\"/assets/img/payment.svg\" class=\"icon\"/><span class=\"labelamount topright\">mon prochain paiement</span><span class=\"topleft amount\">" + (jade.escape(null == (jade_interp = nextPaymentAmount.amount) ? "" : jade_interp)) + "€</span><span class=\"bottomright labeldate\">le&nbsp" + (jade.escape(null == (jade_interp = nextPaymentAmount.scheduleDate) ? "" : jade_interp)) + "</span><span class=\"bottomleft date\">dans un mois</span></div>");
}
if ( lastPaymentAmount)
{
buf.push("<div class=\"lastpayment\"><span class=\"topleft labelamount\">mon dernier paiement &nbsp;</span><span class=\"topright amount\">" + (jade.escape(null == (jade_interp = lastPaymentAmount.amount) ? "" : jade_interp)) + "€</span><span class=\"bottomleft labeldate\">le &nbsp" + (jade.escape(null == (jade_interp = nextPaymentAmount.scheduleDate) ? "" : jade_interp)) + "&nbsp;:</span><span class=\"bottomright date\">il y a un mois</span></div>");
}}.call(this,"annualCost" in locals_for_with?locals_for_with.annualCost:typeof annualCost!=="undefined"?annualCost:undefined,"lastPaymentAmount" in locals_for_with?locals_for_with.lastPaymentAmount:typeof lastPaymentAmount!=="undefined"?lastPaymentAmount:undefined,"modePaiement" in locals_for_with?locals_for_with.modePaiement:typeof modePaiement!=="undefined"?modePaiement:undefined,"nextPaymentAmount" in locals_for_with?locals_for_with.nextPaymentAmount:typeof nextPaymentAmount!=="undefined"?nextPaymentAmount:undefined));;return buf.join("");
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

;require.register("views/templates/houseitems/sinistre.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"row button_sinistre col-md-offset-3\"><button>Sinistre d'habitation</button><ul></ul></div>");;return buf.join("");
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

;require.register("views/templates/houseitems/sinistre_item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

;return buf.join("");
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

buf.push("<button class=\"btn_toute_mes_donnees\">Toutes mes données</button><div class=\"row\"></div>");;return buf.join("");
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

buf.push("<form class=\"form-inline\"><label for=\"uploadfile\" class=\"btn btn-default btn-sm\">Ajouter un fichier ...</label><input name=\"filename\" type=\"text\" placeholder=\"notice.pdf\" class=\"filename form-control\"/><input id=\"uploadfile\" type=\"file\"/><button name=\"addfile\" type=\"button\" class=\"btn btn-success\">sauvegarder</button></form>");;return buf.join("");
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

;require.register("views/templates/menu.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (nameVersion) {
buf.push("<span class=\"category\">Mes fournisseurs\n&emsp;<button title=\"ajouter un fournisseur\" class=\"leftbar btn btn-primary btn-sm add\"><i class=\"fa fa-plus\"></i></button></span><ul></ul><div class=\"codesign\"><a href=\"https://mesinfos.fing.org/forum/d/71-mon-logis-pr-sentation-commentaires-volutions\" title=\"un peu d'aide pour bien utiliser l'application ?\" target=\"_blank\" class=\"help\"><i class=\"fa fa-question-circle\"></i><span class=\"leftbar\">&ensp;Aide</span></a><a href=\"https://mesinfos.fing.org/forum/d/71-mon-logis-pr-sentation-commentaires-volutions\" title=\"suggestion pour améliorer l'application,\nrapports de bugs, ...\" target=\"_blank\" class=\"feedback\"><i class=\"fa fa-comments\"></i><span class=\"leftbar\">&ensp;Suggestions</span></a><a href=\"https://github.com/jacquarg/monlogis\" title=\"code source de l'application\" target=\"_blank\" class=\"code\"><i class=\"fa fa-code\"></i><span class=\"leftbar\">&ensp;" + (jade.escape(null == (jade_interp = nameVersion) ? "" : jade_interp)) + "</span></a></div><button class=\"bottombar btn btn-primary btn-sm add\"><i class=\"fa fa-plus\"></i></button>");}.call(this,"nameVersion" in locals_for_with?locals_for_with.nameVersion:typeof nameVersion!=="undefined"?nameVersion:undefined));;return buf.join("");
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

;require.register("views/templates/vendor_item.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name) {
buf.push(jade.escape(null == (jade_interp = name) ? "" : jade_interp));}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
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

;require.register("views/vendor_item.js", function(exports, require, module) {
'use-strict'

const template = require('./templates/vendor_item')

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
    app.trigger('houseitemdetails:show', this.model)
  },

})

});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

