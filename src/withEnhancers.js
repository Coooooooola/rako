import {_createStores} from './createStores'

function withEnhancers(...enhancers) {
  if (enhancers.some(enhancer => typeof enhancer !== 'function')) {
    throw new TypeError('`withEnhancers`: Expected every `enhancer` to be a function.')
  }
  return function createStores(...producers) {
    return _createStores(producers, enhancers)
  }
}


export {
  withEnhancers
}
