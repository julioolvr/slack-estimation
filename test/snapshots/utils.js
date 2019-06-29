const {
  is,
  keys,
  pipe,
  reduceWhile,
  identity,
  curry,
  invoker
} = require('ramda')

function matchElements (a, b) {
  if (is(Function, a)) {
    return a(b)
  }

  if (is(Array, a)) {
    return matchArray(a, b)
  }

  if (is(Object, a)) {
    return matchObject(a, b)
  }

  return a === b
}

function matchArray (base, test) {
  return is(Array, test) && base.every((x, i) => matchElements(x, test[i]))
}

function matchObject (base, test) {
  return (
    is(Object, test) &&
    pipe(
      keys,
      reduceWhile(
        identity,
        (acc, key) => matchElements(base[key], test[key]),
        true
      )
    )(base)
  )
}

const startsWith = invoker(1, 'startsWith')

module.exports = {
  matchObject: curry(matchObject),
  startsWith
}
