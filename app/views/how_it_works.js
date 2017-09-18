'use strict'

const template = require('./templates/how_it_works')

module.exports = Mn.View.extend({
  className: 'howitworks',
  template: template,

  initialize: function () {
    this.features = {}

    $.getJSON('/doc/features.json')
    .then((software) => {
      software.features.forEach((feature) => {
        this.features[feature['@id']] = feature
      })
    })
    .then(() => this.render())
  },

  serializeData: function () {
    // TODO
    return { features: this.features }
  },

})
