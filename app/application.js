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
      {
        name: 'Free',
        slug: 'free',
        domain: 'telecom',
        konnectorAccount: null,
        folderPath: '/folderPath',
      },
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
    ]); // TODO: fetch
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

