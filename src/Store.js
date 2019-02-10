function setState({type, isSync, substate, extra}) {
  if (this.isSettingState) {
    throw new Error('`setState`: Don\'t `setState` as setting state.')
  }
  if (substate == null || typeof substate !== 'object') {
    throw new TypeError('`setState`: Expected `substate` to be an object, but got: ' + (substate == null ? substate : typeof substate) + '.')
  }
  this.state = Object.freeze(Object.assign({}, this.state, substate))
  const info = Object.freeze({type, isSync, state: this.state, extra})
  this.isSettingState = true
  this.listeners.forEach(listener => listener(info))
  this.isSettingState = false
}

class Store {
  constructor(producer, middleware) {
    if (typeof producer !== 'function') {
      throw new TypeError('`Store`: Expected `producer` to be a function, but got: ' + (producer == null ? producer : typeof producer) + '.')
    }
    if (middleware !== undefined && typeof middleware !== 'function') {
      throw new TypeError('`Store`: Expected `middleware` to be a function, but got: ' + (middleware == null ? middleware : typeof middleware) + '.')
    }

    let _getState = () => {
      throw new Error('`Store`: Don\'t `getState` as constructing store.')
    }
    const result = producer(function getState() {
      return _getState()
    })
    if (result == null || typeof result !== 'object') {
      throw new TypeError('`Store`: Expected returned value from `producer` to be an object, but got: ' + (result == null ? result : typeof result) + '.')
    }

    let _setState

    const values = []
    const functions = []
    Object.keys(result).forEach(type => {
      const value = result[type]
      if (typeof value === 'function') {
        functions.push({[type](...args) {
          let isSync = true
          const ret = value.apply({
            setState(substate, extra) {
              return _setState({type, isSync, substate, extra})
            }
          }, args)
          isSync = false
          return ret
        }})
      } else {
        values.push({[type]: value})
      }
    })

    const _private = {
      state: Object.freeze(Object.assign({}, ...values)),
      actions: Object.freeze(Object.assign({}, ...functions)),
      listeners: [],
      isSettingState: false
    }

    this.getState = this.getState.bind(_private)
    this.getActions = this.getActions.bind(_private)
    this.subscribe = this.subscribe.bind(_private)

    _setState = setState.bind(_private)
    if (middleware) {
        _getState = () => {
          throw new Error('`getState` was broken because an error was thrown while connecting to `middleware`, fixing the bug in `middleware` to return normal.')
        }
      _setState = middleware(this.getState, _setState)
    }
    _getState = this.getState
  }
  getState() {
    return this.state
  }
  getActions() {
    return this.actions
  }
  subscribe(listener) {
    if (this.isSettingState) {
      throw new Error('`subscribe`: Don\'t `subscribe` as setting state.')
    }
    if (typeof listener !== 'function') {
      throw new TypeError('`subscribe`: Expected `listener` to be a function, but got: ' + (listener == null ? listener : typeof listener) + '.')
    }
    this.listeners.push(listener)

    const self = this
    return function unsubscribe() {
      if (self.isSettingState) {
        throw new Error('`unsubscribe`: Don\'t `unsubscribe` as setting state.')
      }
      const index = self.listeners.indexOf(listener)
      if (index !== -1) {
        self.listeners.splice(index, 1)
        return listener
      }
    }
  }
}


export default Store
