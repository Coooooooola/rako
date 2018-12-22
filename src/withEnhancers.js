import {_createStores} from './createStores'

function withEnhancers(...enhancers) {
  enhancers.forEach(enhancer => {
    if (typeof enhancer !== 'function') {
      throw new TypeError('`withEnhancers`: Expected each `enhancer` in `enhancers` to be a function.')
    }
  })
  return function createStores(...producers) {
    return _createStores(producers, enhancers)
  }
}


export {
  withEnhancers
}
