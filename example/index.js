import Store from 'rabbit-store'

function profile(update) {
  const pattern = {
    name: name => /^\w+$/.test(name),
    random: num => !isNaN(num)
  }

  return {
    name: 'rabbit',
    random: Math.random(),
    updateRandom() {
      update({random: Math.random()})
    },
    update(state) {
      const isValid = Object.keys(state).every(key => !(key in pattern) || pattern[key](state[key]))
      if (isValid) {
        update(state)
      }
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
  return Object.keys(subState).every(key => key in state) && subState
})
const updater = store.getUpdater()

store.subscribe(state => console.log('subscribe', state))

const {$profile, $inner: {$contact}} = updater
$profile.updateRandom()
$contact.increase()

updater.optimize(({$profile, $inner: {$contact}}, state) => {
  $profile.updateRandom()
  $contact.increase()
})

const store2 = new Store({profile, anotherStore: store})

store2.getUpdaters().$anotherStore.$profile.updateRandom()
console.log(store2.getState().anotherStore === store.getState())
