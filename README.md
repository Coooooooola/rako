# Rako


[![LICENSE](https://img.shields.io/badge/license-MIT%20(The%20996%20Prohibited%20License)-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)


## Introduction

Rako is a declarative state container for Javascript apps.

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



## API

`createStores(...producers: Array<function>): Array<Store>`

`withMiddlewares(...middlewares: Array<function>): createStores`

`store.subscribe(listener: function): unsubscribe`

`store.getState(): object`

`store.getActions(): object`


Usage of `producer`:

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

`getState()` in `producer` is equivalent to `store.getState()`, but you can't `getState()` as constructing `Store`.

`this.setState(substate: object, extra: any?)`



## Note

**The concept of `action` in Rako is different to Redux's.** You can learn MVC mentioned before.
