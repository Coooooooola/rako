# Rako

## Introduction

Rako is a declarative state container inspired by `OOP` and redux's `action.type` for Javascript apps.

You don't need to learn any concept, just use it. Really simple but powerful.


## Installation

`yarn add rako` or `npm install rako`.

Work with react: `rako-react`.

`rako-react` github: https://github.com/rabbitooops/rako-react


## API

#### `new Store(source: function)`
- ##### `source(update): object`

#### `createStores(sources: object): object`

#### `store.getState(): object`

#### `store.getActions(): object`

#### `store.subscribe(listener: function): function`


## Demo

````js
function profile(getState) {
  return {
    name: 'rako',
    gender: 'male',
    updateName(name) {
      this.update({name})
    },
    updateGender(gender) {
      this.update({gender})
    }
  }
}

function bank(getState) {
  const calcBalance = (money, balance) => balance + money

  return {
    balance: 50,
    send: 0,
    receive: 0,
    sendMoney(money) {
      const {send, balance} = getState()
      this.update({
        send: send + money,
        balance: calcBalance(-money, balance)
      })
    },
    receiveMoney(money) {
      const {receive, balance} = getState()
      this.update({
        receive: receive + money,
        balance: calcBalance(money, balance)
      })
    }
  }
}

const {profile$, bank$} = createStores({profile, bank})

profile$.subscribe(state => console.log('subscribe', state))

const actions = profile$.getActions()

actions.updateGender('female')
````

example link: https://codesandbox.io/s/011136qpkn
