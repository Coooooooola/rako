const $$updaters = Symbol ? Symbol('updaters') : '(updaters)-rabbit-2333'
const $$pureUpdaters = Symbol ? Symbol('pure-updaters') : '(pure-updaters)-rabbit-2334'
const $$state = Symbol ? Symbol('state') : '(state)-rabbit-2335'
const $$newState = Symbol ? Symbol('new-state') : '(new-state)-rabbit-2336'

const $$listeners = Symbol ? Symbol('listeners') : '(listeners)-rabbit-2337'
const $$beforeUpdate = Symbol ? Symbol('beforeUpdate') : '(beforeUpdate)-rabbit-2338'

const $$status = Symbol ? Symbol('status') : '(status)-rabbit-2339'
const FREE = 0, READONLY = 1, OPTIMIZE = 2

const $$isDirty = Symbol ? Symbol('is-dirty') : '(is-dirty)-rabbit-233A'

function unsubscribe(listener) {
  const index = this[$$listeners].indexOf(listener)
  if (index !== -1) {
    this[$$listeners].splice(index, 1)
    return listener
  }
}

function _update(state) {
  if (this[$$status] === READONLY) {
    this[$$status] = FREE
    throw new Error('Runtime Error: You cannot update state in listeners.')
  } else if (this[$$status] === OPTIMIZE) {
    this[$$isDirty] = true
    this[$$newState] = Object.assign(this[$$newState], state)
    return
  }
  this[$$state] = Object.freeze(Object.assign({}, this.getState(), state))
  this[$$status] = READONLY
  this[$$listeners].forEach(listener => listener(this.getState()))
  this[$$status] = FREE
}

function update(state) {
  if (state == null || typeof state !== 'object') {
    throw new TypeError('Store update: type is invalid -- expected an object but got: ' + (state == null ? state : typeof state) + '.')
  }
  if (this[$$beforeUpdate]) {
    state = this[$$beforeUpdate](state, this.getState())
    if (state === false) {
      return
    }
    if (state == null || typeof state !== 'object') {
      throw new TypeError('Return type of Store beforeUpdate: type is invalid -- expected an object or false but got: ' + (state == null ? state : typeof state) + '.')
    }
  }
  _update.call(this, state)
}

function optimize(optimizer) {
  if (typeof optimizer !== 'function') {
    throw new TypeError('Store updaters.optimize: type is invalid -- expected a function but got:' + (optimizer == null ? optimizer : typeof optimizer) + '.')
  }
  if (this[$$status] === READONLY) {
    this[$$status] = FREE
    throw new Error('Runtime Error: You cannot run updaters.optimize to update state in listeners.')
  } else if (this[$$status] === OPTIMIZE) {
    this[$$status] = FREE
    throw new Error('Runtime Error: You have already in optimize mode, avoid to rerun it.')
  }
  this[$$status] = OPTIMIZE
  this[$$isDirty] = false
  this[$$newState] = {}
  optimizer(this[$$pureUpdaters], this.getState())
  if (this[$$isDirty]) {
    this[$$state] = Object.freeze(Object.assign({}, this.getState(), this[$$newState]))
    this[$$status] = READONLY
    this[$$listeners].forEach(listener => listener(this.getState()))
    this[$$status] = FREE
  } else {
    this[$$newState] = null
    this[$$status] = FREE
    throw new Error('Runtime Error: You have not updated state, maybe you invoid update in async function, avoid to use optimize in this case.')
  }
  this[$$newState] = null
  this[$$status] = FREE
}

class Store {
  constructor(providers, beforeUpdate) {
    const typeofProvidiers = typeof providers
    if (providers == null || typeofProvidiers !== 'function' && typeofProvidiers !== 'object') {
      throw new TypeError('Store: type is invalid -- expected an object or function but got: ' + (providers == null ? providers : typeofProvidiers) + '.')
    }
    if (beforeUpdate !== undefined && typeof beforeUpdate !== 'function') {
      throw new TypeError('Store: type is invalid -- expected an object or function but got: ' + (beforeUpdate == null ? beforeUpdate : beforeUpdate) + '.')
    }
    if (beforeUpdate) {
      this[$$beforeUpdate] = beforeUpdate
    }
    const updaters = {}
    const state = {}
    if (typeofProvidiers === 'function') {
      const $update = update.bind(this)
      const result = providers($update)
      if (result == null || typeof result !== 'object') {
        throw new TypeError('Return of providers: type is invalid -- expected an object but got: ' + (result == null ? result : typeof result) + '.')
      }
      Object.keys(result).forEach(key => {
        const value = result[key]
        if (typeof value === 'function') {
          updaters[key] = (...args) => value.apply(this.getState(), args)
        } else {
          state[key] = value
        }
      })
      if (!('update' in updaters)) {
        updaters.update = $update
      }
    } else {
      const keys = Object.keys(providers)
      if (!keys.length) {
        throw new Error('Runtime Error: Providers not found in object as initializing Store.')
      }
      keys.forEach(key => {
        const store = providers[key] instanceof Store ? providers[key] : new Store(providers[key], beforeUpdate)
        store.subscribe(_state => _update.call(this, {[key]: _state}))
        updaters[`$${key}`] = store.getUpdaters()
        state[key] = store.getState()
      })
      this[$$pureUpdaters] = Object.freeze(Object.assign({}, updaters))
      updaters.optimize = optimize.bind(this)
    }
    this[$$updaters] = Object.freeze(updaters)
    this[$$state] = Object.freeze(state)
    this[$$status] = FREE
    this[$$listeners] = []
  }
  getState() {
    return this[$$state]
  }
  getUpdaters() {
    return this[$$updaters]
  }
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('store.subscribe: type is invalid -- expected a function but got: ' + (listener == null ? listener : typeof listener))
    }
    this[$$listeners].push(listener)
    return unsubscribe.bind(this, listener)
  }
}

export default Store
