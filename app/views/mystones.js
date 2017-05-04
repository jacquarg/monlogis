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
