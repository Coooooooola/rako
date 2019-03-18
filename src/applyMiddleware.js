function applyMiddleware(middlewares) {
  return function enhancer(getState, updateStore, actions) {
    let next = updateStore
    function runMiddlewares(substate, extra, type, isSync) {
      return next(substate, extra, type, isSync)
    }

    const nexts = middlewares.map(middleware => middleware(getState, runMiddlewares, actions))
    for (let i = nexts.length - 1; i >= 0; i--) {
      next = nexts[i](next)
    }
    return runMiddlewares
  }
}


export {
  applyMiddleware
}
