# Rako



## Introduction

Rako is a declarative and predictable state container inspired by `OOP` and the purpose of `action.type` in Redux for Javascript apps.

**Rako is like a Controller in MVC.**

![mvc](./imgs/mvc.png)



## Installation

`yarn add rako` or `npm install rako`.



## Work with React

> `rako-react`: **https://github.com/rabbitooops/rako-react**



## Example

> `rako-react-example`: **https://codesandbox.io/s/011136qpkn**

After you open the link of **codeSandbox** above, because **codeSandbox** doesn't support `console.group`, please press **`Ctrl + Shift + J`**(on Windows) or **`Ctrl + Option + J`**(on macOS) to open **\`DevTools > Console\`**.

![example](./imgs/example.png)



## Design

Rako is inspired by `OOP`, simple and intuitive.

```js
const counter = {
  value: 0,
  increment() {
    this.value += 1
  }
}
counter.increment()
```

Let's transform it for fitting our design:

> 1. Immutable state.
> 2. Do some side subscribes every updating.
> 3. Locate `setState` as updating. (You have got to open the example link above to get more details.)

```js
import {withEnhancers, createStores} from 'rako'

/**
 * I call such function as `producer`.
 * `producer` produces an object which be used to construct `Store`.
 */
function counter(getState) {
  return {
    value: 0,
    increment() {
      const {value} = getState()
      this.setState({value: value + 1})
    }
  }
}

/**
 * createStores(...producers: Array<function>): Array<Store>
 * 
 * Usage: Create stores.
 */
const [counterStore] = createStores(counter)

/**
 * withEnhaner(...enhancers: Array<function>): createStores
 * 
 * Usage: You can also use `withEnhancers` for using some enhancers such as `rako-logger` to create stores.
 * The returned value is the same as `createStore`.
 */
// const [counterStore] = withEnhancers(logger('counterModule'))(counter)


/**
 * store.getState()
 * 
 * Usage: Get store's state.
 */
console.log(counterStore.getState())  // Print `{value: 0}`

/**
 * store.subscribe(listener: function): function
 * 
 * Usage: Subscribe a side effect, return an `unsubscribe` function,
 * you can call `unsubscribe()` to unsubscribe this side effect.
 */
const unsubscribe = counterStore.subscribe(state => console.log('state:', state))

/**
 * store.getActions()
 * 
 * Usage: Before `increment`, you have got to get `actions` from `counterStore`.
 */
const actions = counterStore.getActions()

// The Console will print `state: {value: 1}` after updating `state`.
actions.increment()
```

That's all usage of Rako!



## API

#### `createStores(...producers: Array<function>): Array<Store>`

#### `withEnhancers(...enhancers: Array<function>): createStores`

#### `store.subscribe(listener: function): function`

#### `store.getState(): object`

#### `store.getActions(): object`


#### Usage of `producer`:

```js
function producer(getState) {

  // you can't call `getState()` as constructing `Store`, otherwise it will cause an error.
  // getState()

  return {
    value: 0,
    doSomething(value) {
      this.setState({value})
    },
    doSomethingAsync(value) {
      setTimeout(() => {
        this.setState({value})
      }, 1000)
    },
    doAnythingYouWant() {
      const {value} = getState()

      // Network request, calculation, whatever you want, Rako is like a Controller in MVC.
      networkRequest(value)
      calculation(value)
      this.setState({value: value + 1})
    }
  }
}
```

**`getState()` in `producer` is equivalent to `store.getState()`, but you can't `getState()` as constructing `Store`.**

**`this.setState(substate: object)`**



## Note

**The concept of `action` in Rako is different to Redux's.** You can learn MVC mentioned before.
