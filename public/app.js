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
const InfosClientView = require('views/infos_client');

module.exports = Mn.View.extend({
  template: template,
  el: '[role="application"]',

  behaviors: {},

  regions: {
    message: '.message',
    infosClient: '.client',
  },

  initialize: function () {
  },

  onRender: function () {
    this.showChildView('message', new MessageView());
    this.showChildView('infosClient', new InfosClientView());
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

require.register("views/templates/app_layout.jade", function(exports, require, module) {
var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"container\"><main><h1>Mon Logis</h1><div class=\"infos\"><h2>Les infos de mon logis</h2><div class=\"client\"></div></div></main></div><div class=\"message\"></div>");;return buf.join("");
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

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map