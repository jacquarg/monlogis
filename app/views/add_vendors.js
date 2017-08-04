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
      data.mesinfos.push(_.findWhere(this.rawData, { slug: 'orangemobile' }))
      data.mesinfos.push(_.findWhere(this.rawData, { slug: 'orangelivebox' }))
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
