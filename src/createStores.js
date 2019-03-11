import Store from './Store'

function applyMiddleware(middlewares) {
  return function enhancer(getState, setState, actions) {
    let _setState = setState
    const setStatePointer = function setState(substate, extra, type, isSync) {
      return _setState(substate, extra, type, isSync)
    }

    const nexts = middlewares.map(middleware => middleware(getState, setStatePointer, actions))
    for (let i = nexts.length - 1; i >= 0; i--) {
      _setState = nexts[i](_setState)
    }
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
