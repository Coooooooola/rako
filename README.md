# rako

## Installation

`yarn add rako` or `npm install rako`.


## API

### `new Store(descriptor: function, middleware: function?)`

### `createStores(stores: object)`

### `store.getState()`

### `store.getUpdater()`

### `store.subscribe(listener: function)`


## Demo

````js
function profile(update) {
  return {
    name: 'rabbit',
    gender: 'male',
    updateName(name) {
      update({name})
    },
    updateGender(gender) {
      update({gender})
    }
  }
}

function bankAccount(update) {
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

const [profile$, bankAccount$] = createStores({profile, bankAccount})

profile$.subscribe(console.log)
profile$.getUpdater().updateName('big rabbit')
````

demo link: https://codesandbox.io/s/011136qpkn
