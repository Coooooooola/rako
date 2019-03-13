import Store from './Store'
import {applyMiddleware} from './applyMiddleware'

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
