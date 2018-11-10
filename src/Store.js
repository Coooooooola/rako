function compose(funcs) {
  return funcs.reduce((a, b) => arg => a(b(arg)))
}

function applyMiddleware(...middlewares) {
  return (getState, update) => {
    let _update = () => {
      throw new Error('`applyMiddleware`: Don\'t `update` as constructing `middleware`.')
    }
    const dispatch = action => _update(action)
    const chain = middlewares.map(middleware => middleware(getState, dispatch))
    _update = compose(chain)(update)
    return _update
  }
}

function unsubscribe(listener) {
  if (this.isUpdating) {
    throw new Error('`unsubscribe`: Don\'t `unsubscribe` as updating.')
  }
  const index = this.listeners.indexOf(listener)
  if (index !== -1) {
    this.listeners.splice(index, 1)
    return listener
  }
}

function update(action) {
  if (this.isUpdating) {
    throw new Error('`update`: Don\'t `update` as updating.')
  }
  // This problem can only occur when you develop `enhancer`, most of users needn't to learn how to write `enhancer`, so I remove it.
  // if (action == null || typeof action !== 'object') {
  //   throw new Error('`update`: Expected `action` to be an object, but got: ' + (action == null ? action : typeof action) + '.')
  // }
  const {substate} = action
  if (substate == null || typeof substate !== 'object') {
    throw new TypeError('`update`: Expected `state` to be an object, but got: ' + (substate == null ? substate : typeof substate) + '.')
  }
  this.state = Object.freeze(Object.assign({}, this.state, substate))
  this.isUpdating = true
  this.listeners.forEach(listener => listener(this.state))
  this.isUpdating = false
}

class Store {
  constructor(producer, middleware) {
    if (typeof producer !== 'function') {
      throw new TypeError('`new Store`: Expected `producer` to be a function, but got: ' + (producer == null ? producer : typeof producer) + '.')
    }
    if (middleware !== undefined && typeof middleware !== 'function') {
      throw new TypeError('`new Store`: Expected `middleware` to be a function, but got: ' + (middleware == null ? middleware : typeof middleware) + '.')
    }
    const state = {}
    const actions = {}
    const _private = {
      state,
      actions,
      listeners: [],
      isUpdating: false
    }

    let getState = () => {
      throw new Error('`new Store`: Don\'t `getState` as constructing store.')
    }

    let _update
    let isSync = false
    const updatePointer = type => substate => _update({type, substate, isSync})

    const result = producer(() => getState())
    if (result == null || typeof result !== 'object') {
      throw new TypeError('`new Store`: Expected `return value` from `producer` to be an object, but got: ' + (result == null ? result : typeof result) + '.')
    }
    Object.keys(result).forEach(key => {
      const value = result[key]
      if (typeof value === 'function') {
        const context = {update: updatePointer(key)}
        actions[key] = (...args) => {
          isSync = true
          const ret = value.apply(context, args)
          isSync = false
          return ret
        }
      } else {
        state[key] = value
      }
    })

    Object.freeze(state)
    Object.freeze(actions)
    this.getState = this.getState.bind(_private)
    this.getActions = this.getActions.bind(_private)
    this.subscribe = this.subscribe.bind(_private)

    getState = () => {
      throw new Error('new State: `getState` was broken because an error was throwing as applying `middleware`, fixing the bug in `middleware` to return normal.')
    }
    _update = middleware ? middleware(this.getState, update.bind(_private)) : update.bind(_private)
    getState = this.getState
  }
  getState() {
    return this.state
  }
  getActions() {
    return this.actions
  }
  subscribe(listener) {
    if (this.isUpdating) {
      throw new Error('`subscribe`: Don\'t `subscribe` as updating.')
    }
    if (typeof listener !== 'function') {
      throw new TypeError('`subscribe`: Expected `listener` to be a function, but got: ' + (listener == null ? listener : typeof listener) + '.')
    }
    this.listeners.push(listener)
    return unsubscribe.bind(this, listener)
  }
}

function createStores(producers, ...enhancers) {
  if (producers == null || typeof producers !== 'object') {
    throw new TypeError('`createStores`: Expected `producers` to be an object, but got: ' + (producers == null ? producers : typeof producers) + '.')
  }
  const stores = Object.keys(producers).map(key => {
    const middlewares = enhancers.length ? enhancers.map(enhancer => enhancer(key)).filter(middleware => middleware !== null) : undefined
    const middleware = middlewares && middlewares.length ? applyMiddleware(...middlewares) : undefined
    return {[`${key}$`]: new Store(producers[key], middleware)}
  })
  return Object.assign({}, ...stores)
}

export {
  createStores
}
export default Store
