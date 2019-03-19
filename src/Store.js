const DONT_GETSTATE = function getState() {
  throw new Error("Don't `getState` as constructing store.")
}

const BROKEN_GETSTATE = function getState() {
  throw new Error("`getState` was broken.")
}


function Store(producer, enhancer) {
  let _getState = DONT_GETSTATE
  const result = producer(function getState() {
    return _getState()
  })
  if (result == null || typeof result !== 'object') {
    throw new TypeError("Expected returned value from `producer` to be an object.")
  }


  let next

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
                return next(substate, extra, type, isSync)
              }
            }, args)
          } finally {
            isSync = false
          }
          return ret
        }
      })
    } else {
      values.push({[type]: value})
    }
  }


  let state = Object.freeze(Object.assign({}, ...values))
  const actions = Object.freeze(Object.assign({}, ...functions))
  let listeners = []
  let hasNullInListeners = false
  let callStackDepth = 0


  this.getState = function getState() {
    return state
  }
  this.getActions = function getActions() {
    return actions
  }
  this.subscribe = function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError("Expected `listener` to be a function.")
    }
    listeners.push(listener)

    return function unsubscribe() {
      if (!listener) {
        return
      }
      const index = listeners.lastIndexOf(listener)
      if (callStackDepth) {
        listeners[index] = null
        hasNullInListeners = true
      } else {
        listeners.splice(index, 1)
      }

      const ret = listener
      listener = null
      return ret
    }
  }


  next = function updateStore(substate, extra, type, isSync) {
    if (substate == null || typeof substate !== 'object') {
      throw new TypeError("Expected `substate` to be an object.")
    }
    state = Object.freeze(Object.assign({}, state, substate))
    const currentState = state

    callStackDepth += 1
    try {
      for (let i = 0, length = listeners.length; i < length && currentState === state; i++) {
        if (listeners[i]) {
          listeners[i](state, extra, type, isSync)
        }
      }
    } finally {
      callStackDepth -= 1
      if (!callStackDepth && hasNullInListeners) {
        listeners = listeners.filter(listener => !!listener)
        hasNullInListeners = false
      }
    }
  }


  if (enhancer) {
    _getState = BROKEN_GETSTATE
    next = enhancer(this.getState, next, actions)
  }


  _getState = this.getState
}


export default Store
