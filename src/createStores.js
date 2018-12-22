import Store from './Store'

function compose(functions) {
  return functions.reduce((a, b) => arg => a(b(arg)))
}

function applyMiddleware(middlewares) {
  return (getState, setState) => {
    let _setState = setState
    const setStatePointer = payload => _setState(payload)

    const chain = middlewares.map(middleware => middleware(getState, setStatePointer))
    _setState = compose(chain)(setState)
    return _setState
  }
}


function _createStores(producers, enhancers) {
  const set = new Set()
  producers.forEach(producer => {
    if (typeof producer !== 'function') {
      throw new TypeError('`createStores`: Expected each `producer` in `producers` to be a `function`.')
    }
    if (set.has(producer.name)) {
      throw new Error('`createStores`: Duplicate `producer`\'s name: "' + producer.name + '".')
    }
    set.add(producer.name)
  })

  return producers.map(producer => {
    const middlewares = enhancers.map(enhancer => enhancer(producer.name)).filter(middleware => middleware !== null)
    return new Store(producer, middlewares.length ? applyMiddleware(middlewares) : undefined)
  })
}

function createStores(...producers) {
  return _createStores(producers, [])
}


export {
  _createStores,
  createStores
}
