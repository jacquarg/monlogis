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

require('views/behaviors');

const Application = Mn.Application.extend({

  prepare: function () {
    this._splashMessages();

    const appElem = $('[role=application]')[0];
    cozy.client.init({
      cozyURL: `//${appElem.dataset.cozyDomain}`,
      token: appElem.dataset.cozyToken,
    });
    cozy.bar.init({ appName: 'Mon Logis' });

    this.properties = Properties;

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

const name = 'lamusiquedemesfilms';
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
module.exports = Backbone.Collection.extend({

  getFetchIndex: () => ['_id'],

  getFetchQuery: () => ({ selector: { _id: { $gt: null } } }),

  sync: function(method, collection, options) {
    if (method !== 'read') {
      console.error('Only read is available on this collection.');
      if (options.error) {
        options.error('Only read is available on this collection.');
      }
      return;
    }

    const docType = new this.model().docType.toLowerCase();

    cozy.client.data.defineIndex(docType, this.getFetchIndex())
    .then(function(index) {
      return cozy.client.data.query(index, this.getFetchQuery());
    })
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

  syncPromise: function (method, model) {
    console.log(model);
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
      return cozy.client.find(this.docType, model.attributes._id);
    }
  },
});

});

require.register("lib/backbone_cozysingleton.js", function(exports, require, module) {
'use-strict';

const CozyModel = require('./backbone_cozymodel');

module.exports = CozyModel.extend({

  sync: function (method, model, options) {
    if (method === 'read' && model.isNew()) {
      return cozy.client.data.defineIndex(this.docType.toLowerCase(), ['_id'])
      .then((index) => {
        return cozy.client.data.query(index, { selector: { _id: { $gt: null } }, limit: 1 });
      })
      .then(res => ((res && res.length !== 0) ? res[0] : {}))
      .then(options.success, (err) => {
        console.error(err);
        return options.error(err);
      });
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

require.register("models/client.js", function(exports, require, module) {
'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.client',
});

});

require.register("models/home.js", function(exports, require, module) {
'use-strict';

const CozySingleton = require('../lib/backbone_cozysingleton');

module.exports = CozySingleton.extend({
  docType: 'org.fing.mesinfos.home',
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
const VendorsView = require('views/houseitems/vendors');

module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',
  behaviors: {},

  regions: {
    message: '.message',
    myStones: '.mystones',
    houseitemDetails: '.houseitemdetails',
    vendors: '.vendors',
  },

  initialize: function () {
    this.listenTo(app, 'houseitemdetails:show', this.showHouseItemDetails);
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('myStones', new MystonesView());
    this.showChildView('vendors', new VendorsView());
  },

  showHouseItemDetails: function (houseItem) {
    const slug = houseItem.get('slug');
    let viewClass = null;
    if (slug == 'edf') {
      viewClass = HouseitemDetailsEDFView;
    } else if (slug === 'maif') {
      console.log('todo');
      //viewClass = HouseitemDetailsMaifView;
    }

    this.showChildView('houseitemDetails', new viewClass());
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

require.register("views/houseitems/details_edf.js", function(exports, require, module) {
'use strict';

const template = require('../templates/houseitems/details_edf');
const Client = require('../../models/client');

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

const VendorsCollection = require('collections/vendors');

const VendorsView = Mn.CollectionView.extend({
  tagName: 'ul',
  className: 'movielibrary',
  childView: VendorItemView,
});

module.exports = Mn.View.extend({
  //className: 'mymovies',
  template: template,

  regions: {
    collection: {
      el: 'ul',
      replaceElement: true,
    },
  },

  initialize: function () {
    this.collection = new VendorsCollection([
    {
      name: 'EDF',
      slug: 'edf',
      doamin: 'energy',
      konnectorAccount: null,
      folderPath: 'administration/EDF/',
    },
      {
      name: 'Maif',
      slug: 'maif',
      domain: 'insurance',
      konnectorAccount: null,
      folderPath: 'administration/Maif/',
    },
    ]);
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
    return $.get(`//nominatim.openstreetmap.org/search?format=json&q=${address.street}+${address.city}+${address.country}`).then((res) => {
        console.log(res);
        address.point = res[0];
        return address.point;
      });
  },

  onRender: function () {
    if (this.model.isNew()) { return; }
    this.geocode()
    .then((point) => {

        var osmb = new OSMBuildings({
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

    osmb.addMapTiles(
      'https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
      {
        attribution: '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
      }
    );

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

buf.push("<main class=\"row\"><div class=\"col-xs-4 mystones\"><div class=\"well\">TODO : addresse</div></div><div class=\"col-xs-2 houseitems\"><div class=\"row vendors\"><div class=\"well\">TODO : Énergie - EDF</div></div><div class=\"row equipments\"><div class=\"well\">TODO : TV</div></div><div class=\"row objects\"><div class=\"well\">TODO : table</div></div></div><div class=\"col-xs-6 houseitemdetails\"></div></main><div class=\"message\"></div>");;return buf.join("");
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
;var locals_for_with = (locals || {});(function (name) {
buf.push("<h2>Énergie - EDF</h2>");
if ( name)
{
buf.push("<h3>Titulaire du contrat</h3><div class=\"holder\">" + (jade.escape(null == (jade_interp = name.formated) ? "" : jade_interp)) + "</div>");
}}.call(this,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
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