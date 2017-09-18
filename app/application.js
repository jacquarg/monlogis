'use-strict'

// Main application that create a Mn.Application singleton and
// exposes it.
const Router = require('router')
const AppLayout = require('views/app_layout')
const Properties = require('models/properties')

const VendorsCollection = require('collections/vendors')
// const EquipmentsCollection = require('collections/equipments')
const ObjectsCollection = require('collections/objects')
const Logis = require('models/logis')


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

    this.properties = Properties
    this.vendors = new VendorsCollection()
    this.objects = new ObjectsCollection()
    this.logis = new Logis()
    this.konnectors = []
    return this.properties.fetch()
    .then(() => $.getJSON('/assets/data/konnectors.json'))
    .then((data) => { this.konnectors = data })
    .then(() => Promise.all([
      this._fetchAppsURI(),
      this.vendors.init(),
      // this.objects.fetch(),
    ]))
    .then(() => this._defineViews())
  },

  _fetchAppsURI: function () {
    cozy.client.fetchJSON('GET', '/apps/')
    .then((apps) => {
      this.appDriveURI = _.findWhere(apps, { _id: 'io.cozy.apps/drive' }).links.related
      this.appCollectURI = _.findWhere(apps, { _id: 'io.cozy.apps/collect' }).links.related
    })
    .catch((err) => {
      console.warn("Can't fetch drive app url. In drive links won't work.", err)
    })
  },

  prepareInBackground: function () {
    cozyUsetracker()
    .catch(err => console.warn('Error while initializing tracking.', err))
    .then(() => cozy.bar.init({ appName: 'Mon Logis' }))

    return Promise.resolve()
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

    // TODO : what appens without data !
    app.trigger('houseitemdetails:show', this.logis)

    // if (app.vendors.size() > 0) {
    //   app.trigger('houseitemdetails:show', app.vendors.at(0))
    // } else {
    //   app.layout.onChildviewShowAddvendors()
    // }
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
