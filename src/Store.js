function compose(funcs) {
  return funcs.reduce((a, b) => arg => a(b(arg)))
}

function applyMiddleware(...middlewares) {
  return (getState, update) => {
    let _update = () => {
      throw new Error('Updating while constructing your middleware is not allowed.')
    }
    const closureUpdate = arg => _update(arg)
    const chain = middlewares.map(middleware => middleware(getState, closureUpdate))
    _update = compose(chain)(update)
    return _update
  }
}

function unsubscribe(listener) {
  if (this.isUpdating) {
    throw new Error('You cannot unsubscribe as updating.')
  }
  const index = this.listeners.indexOf(listener)
  if (index !== -1) {
    this.listeners.splice(index, 1)
    return listener
  }
}

function update(state) {
  if (typeof state !== 'object') {
    throw new TypeError('Expected state to be an object.')
  }
  this.state = Object.freeze(Object.assign({}, this.state, state))
  this.isUpdating = true
  this.listeners.forEach(listener => listener(this.state))
  this.isUpdating = false
}

class Store {
  constructor(descriptor, middleware) {
    if (typeof descriptor !== 'function') {
      throw new TypeError('Expected descriptor to be a function.')
    }
    if (middleware !== undefined && typeof middleware !== 'function') {
      throw new TypeError('Expected middleware to be a function.')
    }
    const state = {}
    const updater = {}
    const _private = {
      state,
      updater,
      listeners: [],
      isUpdating: false
    }
    this.getState = this.getState.bind(_private)
    this.getUpdater = this.getUpdater.bind(_private)
    this.subscribe = this.subscribe.bind(_private)
    const result = descriptor(middleware ? middleware(this.getState, update.bind(_private)) : update.bind(_private))
    if (result == null || typeof result !== 'object') {
      throw new TypeError('Expected return value from descriptor to be an object.')
    }
    Object.keys(result).forEach(key => {
      const value = result[key]
      if (typeof value === 'function') {
        updater[key] = (...args) => value.apply(_private.state, args)
      } else {
        state[key] = value
      }
    })
    Object.freeze(state)
    Object.freeze(updater)
  }
  getState() {
    return this.state
  }
  getUpdater() {
    return this.updater
  }
  subscribe(listener) {
    if (this.isUpdating) {
      throw new Error('You cannot subscribe as updating.')
    }
    if (typeof listener !== 'function') {
      throw new TypeError('Expected listener to be a function.')
    }
    this.listeners.push(listener)
    return unsubscribe.bind(this, listener)
  }
}

function createStores(descriptors, ...enhancers) {
  if (descriptors == null || typeof descriptors !== 'object') {
    throw new TypeError('Expected descriptors to be an object.')
  }
  const stores = Object.keys(descriptors).map(key => {
    const middleware = enhancers.length ? applyMiddleware(...enhancers.map(enhancer => enhancer(key))) : undefined
    return {[`${key}$`]: new Store(descriptors[key], middleware)}
  })
  return Object.assign({}, ...stores)
}

export {
  applyMiddleware,
  createStores
}
export default Store
