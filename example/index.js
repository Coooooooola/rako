import Store from 'rabbit-store'

function profile(update) {
  return {
    name: 'rabbit',
    random: Math.random(),
    updateRandom() {
      update({random: Math.random()})
    }
  }
}
function contact(update) {
  return {
    email: 'rabbitmeow886@gmail.com',
    phone: 911,
    inc: 0,
    increase() {
      update({inc: this.inc + 1})
    }
  }
}


const store = new Store({profile, inner: {contact}}, (subState, state) => {
  const isValid = Object.keys(subState).every(key => key in state)
  return isValid && subState
})
const updaters = store.getUpdaters()

store.subscribe(state => console.log('subscribe', state))

const {$profile, $inner: {$contact}} = updaters
$profile.updateRandom()
$contact.increase()

updaters.optimize(({$profile, $inner: {$contact}}, state) => {
  $profile.updateRandom()
  $contact.increase()
})

const store2 = new Store({profile, anotherStore: store})

store2.getUpdaters().$anotherStore.$profile.updateRandom()
console.log(store2.getState().anotherStore === store.getState())
