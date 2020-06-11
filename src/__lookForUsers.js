import Store from './Store'

Store.__showLookForUsers = true
requestAnimationFrame(() => {
  if (Store.__showLookForUsers) {
    console.warn('Are you a Rako user? Can you give me a response on github(https://github.com/rabbitooops/rako)?')
  }
})
