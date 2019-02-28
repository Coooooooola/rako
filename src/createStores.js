import Store from './Store'

function compose(functions) {
  return functions.reduce((a, b) => arg => a(b(arg)))
}

function applyMiddleware(middlewares) {
  return function enhancer(getState, setState, actions) {
    let _setState = setState
    const setStatePointer = function setState(substate, extra, type, isSync) {
      return _setState(substate, extra, type, isSync)
    }

    const chain = middlewares.map(middleware => middleware(getState, setStatePointer, actions))
    _setState = compose(chain)(setState)
    return _setState
  }
}


function _createStores(producers, middlewares) {
  if (producers.some(producer => typeof producer !== 'function')) {
    throw new TypeError("Expected every `producer` to be a function.")
  }
  return producers.map(producer => {
    const maturedMiddlewares = middlewares.map(middleware => middleware(producer)).filter(maturedMiddleware => maturedMiddleware !== null)
    return new Store(producer, maturedMiddlewares.length ? applyMiddleware(maturedMiddlewares) : undefined)
  })
}

function createStores(...producers) {
  return _createStores(producers, [])
}


export {
  _createStores,
  createStores
}
