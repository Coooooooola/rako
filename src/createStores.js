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
  if (producers.some(producer => typeof producer !== 'function')) {
    throw new TypeError('`createStores`: Expected every `producer` to be a function.')
  }
  return producers.map(producer => {
    const middlewares = enhancers.map(enhancer => enhancer(producer)).filter(middleware => middleware !== null)
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
