function applyMiddleware(middlewares) {
  return function enhancer(getState, setState, actions) {
    let _setState = setState
    const setStatePointer = function setState(substate, extra, type, isSync) {
      return _setState(substate, extra, type, isSync)
    }

    const nexts = middlewares.map(middleware => middleware(getState, setStatePointer, actions))
    for (let i = nexts.length - 1; i >= 0; i--) {
      _setState = nexts[i](_setState)
    }
    return _setState
  }
}

export {
  applyMiddleware
}
