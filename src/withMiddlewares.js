import {_createStores} from './createStores'

function withMiddlewares(...middlewares) {
  if (middlewares.some(middleware => typeof middleware !== 'function')) {
    throw new TypeError("Expected every `middleware` to be a function.")
  }
  return function createStores(...producers) {
    return _createStores(producers, middlewares)
  }
}


export {
  withMiddlewares
}
