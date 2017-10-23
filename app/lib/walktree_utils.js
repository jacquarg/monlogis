'use_strict'

module.exports.get = (obj, ...prop) => prop.reduce((current, key) => (current ? current[key] : undefined), obj)

module.exports.getFirst = obj => obj[Object.keys(obj)[0]]

module.exports.safeSet = (data, obj, ...prop) => {
  if (!prop || prop.length === 0) { return false }

  const lastProp = prop.pop()
  const lastObj = module.exports.get(obj, ...prop)
  if (lastObj) {
    lastObj[lastProp] = data
    return true
  }

  return false
}

module.exports.getByMangoSubfields = (obj, key) => {
  const props = []
  key += '.'
  let curProp = ''
  let prev
  let c
  for (let i; i < key.length; i++) {
    c = key.charAt(i)
    if (c === '.') {
      if (prev === '\\') {
        curProp += '.'
      } else {
        props.push(curProp)
        curProp = ''
      }
    } else if (c !== '\\') {
      curProp += c
    }
    prev = c
  }

  return module.exports.get(obj, ...props)
}
