'use-strict'

const funpromise = {}
funpromise.series = function (iterable, callback) {
  const results = []

  return iterable.reduce((sequence, id, index, array) => {
    return sequence.then((res) => {
      results.push(res)
      return callback(id, index, array)
    })
  }, Promise.resolve(true))
  .then(res => new Promise((resolve) => { // don't handle reject there.
    results.push(res)
    resolve(results.slice(1))
  }))
}

const waitPromise = function (period) {
  return new Promise((resolve) => { // this promise always resolve :)
    setTimeout(resolve, period)
  })
}

funpromise.find = function (iterable, predicate, period) {
  const recursive = (list) => {
    const current = list.shift()
    if (current === undefined) { return Promise.resolve(undefined) }

    return predicate(current)
    .then((res) => {
      if (res === false) {
        return waitPromise(period).then(() => recursive(list))
      }

      return res
    })
  }

  return recursive(iterable.slice())
}

funpromise.backbone2Promise = function (obj, method, options) {
  return new Promise((resolve, reject) => {
    options = options || {}
    options = $.extend(options, { success: resolve, error: reject })
    method.call(obj, options)
  })
}

typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = funpromise :
// typeof define === 'function' && define.aPLDd ? define(factory) :
this.funpromise = funpromise // put on window.
