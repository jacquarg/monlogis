'use-strict';

// Main application that create a Mn.Application singleton and
// exposes it.
const AsyncPromise = require('./lib/asyncpromise');
const Router = require('router');
const AppLayout = require('views/app_layout');
const Properties = require('models/properties');

const bPromise = AsyncPromise.backbone2Promise;


require('views/behaviors');

const Application = Mn.Application.extend({

  prepare: function () {
    this._splashMessages();

    var app = $('[role=application]')[0];
    cozy.client.init({
      cozyURL: '//' + app.dataset.cozyDomain,
      token: app.dataset.cozyToken,
    });
    cozy.bar.init({appName: "MesInfos-Dev"});

    this.properties = Properties;

    return this.properties.fetch()
    .then(() => this._defineViews())
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

