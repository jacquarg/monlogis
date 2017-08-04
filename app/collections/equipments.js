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
