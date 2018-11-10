# Rako

## Introduction

Rako is a declarative state container inspired by `OOP` and redux's `action.type` for Javascript apps.

You don't need to learn any concept, just use it. Really simple but powerful.


## Installation

`yarn add rako` or `npm install rako`.

Work with react: `rako-react`.

`rako-react` github: https://github.com/rabbitooops/rako-react


## API

#### `createStores(producers: object, ...enhancers: Array<enhancer>): object`

#### `store.getState(): object`

#### `store.getActions(): object`

#### `store.subscribe(listener: function): function`


## Demo

````js
function counter(getState) {
  return {
    value: 0,
    increment() {
      const {value} = getState()
      this.update({value: value + 1})
    },
    decrement() {
      const {value} = getState()
      this.update({value: value - 1})
    }
  }
}

const {counter$} = createStores({counter})

counter$.subscribe(state => console.log('subscribe', state))

const actions = counter$.getActions()
actions.increment()
````

example link: https://codesandbox.io/s/011136qpkn
