# rako

## Installation

`yarn add rako` or `npm install rako`.

Work with react: `rako-react`.

`rako-react` github: https://github.com/rabbitooops/rako-react


## API

### `new Store(descriptor: function, middleware: function?)`

### `createStores(descriptors: object)`

### `store.getState()`

### `store.getUpdater()`

### `store.subscribe(listener: function)`


## Demo

````js
function profile(update) {
  return {
    name: 'rako',
    gender: 'male',
    updateName(name) {
      update({name})
    },
    updateGender(gender) {
      update({gender})
    }
  }
}

function bank(update) {
  const calcBalance = (money, balance) => balance + money
  return {
    balance: 50,
    send: 0,
    receive: 0,
    sendMoney(money) {
      const {send, balance} = this
      update({
        send: send + money,
        balance: calcBalance(-money, balance)
      })
    },
    receiveMoney(money) {
      const {receive, balance} = this
      update({
        receive: receive + money,
        balance: calcBalance(money, balance)
      })
    }
  }
}

const {profile$, bank$} = createStores({profile, bank})

profile$.subscribe(console.log)
profile$.getUpdater().updateGender('female')
````

example link: https://codesandbox.io/s/011136qpkn
