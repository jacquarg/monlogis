'use strict';

const template = require('../templates/houseitems/foyer_maif');

module.exports = Mn.View.extend({
  template: template,

  events: {
  },

  initialize: function () {
  },

  // getFoyerMaif: function () {
  //   const membres = this.get('membres');
  //   if (membres && membres instanceof Array) {
  //     //eslint-disable-next-line
  //     for (const value of membres) {
  //       return `${value.name.prefix} ${value.name.family}  ${value.name.given}`;
  //     }
  //   }
  // },


  // serializeData: function () {
  //   const data = this.model.toJSON();
  //   data.foyerMaif = this.model.getFoyerMaif();
  //   return data;
  // },

});
