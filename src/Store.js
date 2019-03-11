function Store(producer, enhancer) {
  let _getState = function getState() {
    throw new Error("Don't `getState` as constructing store.")
  }
  const result = producer(function getState() {
    return _getState()
  })
  if (result == null || typeof result !== 'object') {
    throw new TypeError("Expected returned value from `producer` to be an object.")
  }


  let _setState

  const values = []
  const functions = []
  for (const type of Object.keys(result)) {
    const value = result[type]
    if (typeof value === 'function') {
      functions.push({
        [type]: function runAction(...args) {
          let isSync = true
          let ret
          try {
            ret = value.apply({
              setState(substate, extra) {
                return _setState(substate, extra, type, isSync)
              }
            }, args)
          } finally {
            isSync = false
            return ret
          }
        }
      })
    } else {
      values.push({[type]: value})
    }
  }


  let state = Object.freeze(Object.assign({}, ...values))
  const actions = Object.freeze(Object.assign({}, ...functions))
  const listeners = []
  let isUpdatingStore = false


  this.getState = function getState() {
    return state
  }
  this.getActions = function getActions() {
    return actions
  }
  this.subscribe = function subscribe(listener) {
    if (isUpdatingStore) {
      throw new Error("Don't `subscribe` as setting state.")
    }
    if (typeof listener !== 'function') {
      throw new TypeError("Expected `listener` to be a function.")
    }
    listeners.push(listener)

    return function unsubscribe() {
      if (isUpdatingStore) {
        throw new Error("Don't `unsubscribe` as setting state.")
      }
      if (!listener) {
        return
      }
      listeners.splice(listeners.indexOf(listener), 1)
      const ret = listener
      listener = null
      return ret
    }
  }


  _setState = function updateStore(substate, extra, type, isSync) {
    if (isUpdatingStore) {
      throw new Error("Don't `setState` as setting state.")
    }
    if (substate == null || typeof substate !== 'object') {
      throw new TypeError("Expected `substate` to be an object.")
    }
    state = Object.freeze(Object.assign({}, state, substate))

    isUpdatingStore = true
    try {
      for (const listener of listeners) {
        listener(state, extra, type, isSync)
      }
    } finally {
      isUpdatingStore = false
    }
  }


  if (enhancer) {
      _getState = function getState() {
        throw new Error("`getState` was broken.")
      }
    _setState = enhancer(this.getState, _setState, actions)
  }


  _getState = this.getState
}

export default Store
