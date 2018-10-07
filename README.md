# rabbit-store

### 语言(Languages)
English

中文

### 介绍
`rabbit-store`是一个**声明式**、**可预测**、**灵活**、**简单**、**强大**的Javascript状态管理框架。

`rabbit-store`的使命是取代`redux`及`mobx`成为最广泛、最优秀的Javascript状态管理框架。

`rabbit-store`的使用是非常**简单**、**声明式**、**灵活**的，如果你无法理解内部如何运行，暂且当作黑魔法好了。

简单并不意味着功能贫瘠，事实上，在我发布之前，我反复大幅修改了`rabbit-store`了五六次，目的就是为了砍掉华而不实、事倍功半的设计，寻找出我们最需要、最根本的目的并实现它。
所以`rabbit-store`是非常精炼的，它能满足我目前设想的所有功能以及为了避免错误写法而精心设计的API，如果你找到`rabbit-store`无法实现的功能，请联系我让我们一起改进`rabbit-store`。

你可以看到，`rabbit-store`只有极少的API，相比于`redux`以及`mobx`可以说得上是寒酸。
但是我说过了，我的设计是精心的提炼的，事实上我们并不需要像`redux`、`mobx`那样如此复杂的概念和API才能实现我们的目的。

**请不要把`redux`、`mobx`的概念带入`rabbit-store`中**，因为它们为了实现状态管理而设计的概念是没有必要的，接下来，我将介绍`rabbit-store`最本质的概念。从中，你可以看到`rabbit-store`最本质的逻辑。

### 概念

#### 状态以及状态管理
`rabbit-store`是一个状态管理框架。
所谓状态管理，也就是**状态**以及**状态的更新**，更直白地说就是**数据**以及**数据的更新**。

接下来，我将以`state`表示状态。

````js
const state = {name: 'rabbit', age: 21}
````
上面这个例子中，`state`（状态）记录着数据`name`和`age`，我们已经完成了第一步即状态的定义。下面，我们来看看状态的更新。
````js
state.name = 'meow'
````
这就是状态的更新，也许你看到这觉得我在忽悠你（那么简单用你教？）。但是！真的就这么简单呀！然而你们现在使用的状态管理你觉得简单吗？你还在为维护复杂的状态管理框架而加班吗？

也许你会说当前的状态管理框架是为了维护数据的可追溯性（不可变性、可预测性）而不得不采用的设计。但接下来我将展示同样简单的案例来否定实现数据不可变性是一件困难的事。

1. 定义一个储存状态的仓库`store`用于储存`state`
````js
const state = Object.freeze({name: 'rabbit', age: 21})
const store = {state}
````
2. 定义一个`updater`去代理状态的更新 （我原来打算使用`redux`中`action`的概念，但我发现面向对象的思想更能体现`rabbit-store`的代理更新概念）
````js
const updater = {
  updateName(name) {
    store.state = Object.freeze(Object.assign({}, store.state, {name}))
  },
  updateAge(age) {
    store.state = Object.freeze(Object.assign({}, store.state, {name}))
  }
}
````
3. 委托`updater`去更新`name`状态
````js
updater.updateName('meow')
````
结束，恭喜你已经get到了`rabbit-store`的核心，状态的定义以及维护本来就是已经非常声明式并且简单的工作，为何要想得如此复杂？

**再次提醒，不要把`redux`、`mobx`毫无必要用于维持状态的复杂概念带入全新的`rabbit-store`中，这将会给你带来不必要的痛苦。**

下面，我将直接介绍如何使用`rabbit-store`。

### 使用

状态管理的基本功能包括：**定义`state`**、**定义`updater`**、**监听`state`的变化**

#### 1. 定义`state`、`updater`
由于`updater`必须依托于`state`，所以像`redux`设计中将`state`与`action`分开定义的设计是十分糟糕的，与其分开定义，不如合在一起。

````js
function profile(update) {
  return {
    name: 'rabbit',
    age: 21,
    inc: 0,
    increase() {
      update({inc: this.inc + 1})
    }
  }
}
````
如此简单、声明式的设计，相信你看到的第一眼就会喜欢上它，也许你会好奇`rabbit-store`是如何操作它的，但是这不关你的事，在你会使用之前，把它当作**黑魔法**就好了。（需要注意的是，请务必将`increase`设为常规函数，否则你无法使用`this`，`this`指向状态`state`）

#### 2. `new Store`并获取`state`、`updaters`
与`redux`相反，`rabbit-store`并不建议你整个项目只用一个`store`，而是项目有一个共用`store`的同时为每个模块写一个自己的`store`。更为具体的用法将在以后的更新中介绍。

````js
const store = new Store({profile})
const updaters = store.getUpdaters()
const state = store.getState()
````

#### 3. 监听`state`的更新
每次调用update时，都会触发一次事件监听，`store.subscribe`使一个监听函数能订阅监听事件，返回取消监听事件的函数`unsubscribe`。
````js
const unsubscribe = store.subscibe(state => console.log('subscibe', state))
````

#### 4. `updater`代理更新
````js
const {$profile} = updaters
$profile.increase()
$profile.update({name: 'meow'})
````
当调用`$profile.increase`时，会触发一次事件监听，当调用`$profile.update`会再次触发事件监听。也许你会好奇`$profile.update`这个函数我们没定义呀，为什么会出现在这里呢？这是因为当`state`特别多时，为了为每个`state`更新状态，会写特别多的样板代码。

因此，`rabbit-store`直接将传入`profile`函数的`update`附在`updaters`上，你便可以很方便地更新每个`state`。

以上便是`rabbit-store`最基本的用法了，非常简单不是吗？


## 进阶

进阶用法用于处理一些基本用法无法解决的问题

#### 场景一：避免由于调用`update`污染`state`。
````js
$profile.update({error: 'I should not be assigned to state.'})
````
解决方法：传入`Store`的第二个参数`beforeUpdate`拦截更新
````js
const store = new Store({profile}, (subState, state) => {
  const isValid = Object.keys(subState).every(key => key in state)
  if (!isValid) {
    throw new Error('Invalid state of update.')
    // or: return undefined
    // Give up updating
  }
  return subState
})
````


#### 场景二：有一个`const store = new Store({profile, contact})`，更新`profile`和`contact`，普通API会触发两次事件监听，但是为了避免由于`listener`重度计算导致的性能问题我想只触发一次事件监听
````js
const updaters = store.getUpdaters()
const {$profile, $contact} = updaters
$profile.update({name: 'meow', inc: 100})
$contact.update({email: 'rabbitmeow886@gmail.com'})
````
解决方法：使用`updaters.optimize`将多次触发事件监听减少为只触发一次事件监听
````js
updaters.optimize(({$profile, $contact}) => {
  $profile.update({name: 'meow', inc: 100})
  $contact.update({email: 'rabbitmeow886@gmail.com'})
})
````

欢迎提出更多场景，这能让`rabbit-store`日益完善。

### API

#### `new Store(providers: object|function, beforeUpdate: function?)`

#### `store.getUpdaters()`

#### `store.getState()`

#### `store.subscribe(listener: function): function`

#### `updaters.optimize(optimizer: function)`


更为详细的用法你可以查看`example/index.js`

备注：错误信息、概念名字待定，欢迎提出建议

最后_________________________________求个offer Q_Q
