import Store from "../Store"

describe('Store', () => {
  function profile(update) {
    return {
      name: 'rabbit',
      age: 21,
      getOlder() {
        update({name: 'older ' + this.name, age: this.age + 1})
      }
    }
  }
  function contact(update) {
    return {
      phone: 12345,
      email: 'rabbitmeow886@gmail.com',
      inc: 1,
      updateAll() {
        update({inc: this.inc + 1})
        update({phone: 911})
        update({inc: this.inc + 100})
      }
    }
  }
  let store1 = null
  let store2 = null
  let store3 = null

  let actions1 = null
  let actions2 = null
  let actions3 = null

  let listener1 = null
  let listener2 = null
  let listener3 = null

  beforeEach(() => {
    store1 = new Store(profile)
    store2 = new Store({profile, contact})
    store3 = new Store({profile, inner: {contact}})

    actions1 = store1.getUpdaters()
    actions2 = store2.getUpdaters()
    actions3 = store3.getUpdaters()

    listener1 = jest.fn()
    listener2 = jest.fn()
    listener3 = jest.fn()

    store1.subscribe(listener1)
    store2.subscribe(listener2)
    store3.subscribe(listener3)
  })

  it('Wrong way to new Store', () => {
    expect(() => new Store()).toThrowError('Store:')
    expect(() => new Store('hello')).toThrowError('Store:')
    expect(() => new Store({msg: 'hello'})).toThrowError('Store:')
    expect(() => new Store({profile, msg: 'hello'})).toThrowError('Store:')
    expect(() => new Store({obj: {msg: 'hello'}})).toThrowError('Store:')

    expect(() => new Store({})).toThrowError('Runtime Error: Providers not found in object as initializing Store.')
    expect(() => new Store({inner: {}})).toThrowError('Runtime Error: Providers not found in object as initializing Store.')
    
    expect(() => new Store(() => {})).toThrowError('Return of providers:')
    expect(() => new Store({func: () => {}})).toThrowError('Return of providers:')
    expect(() => new Store({func: () => null})).toThrowError('Return of providers:')
    expect(() => new Store({obj: {func: () => '123'}})).toThrowError('Return of providers:')

    expect(() => new Store(profile, false)).toThrowError('Store: type is invalid -- expected an object or function')
    expect(() => new Store(profile, null)).toThrowError('Store: type is invalid -- expected an object or function')
    expect(() => new Store(profile, {})).toThrowError('Store: type is invalid -- expected an object or function')
    expect(() => new Store(profile, {msg: 'hi'})).toThrowError('Store: type is invalid -- expected an object or function')

    expect(() => {
      const s = new Store(profile, () => null)
      s.getUpdaters().update({})
    }).toThrowError('beforeUpdate')

    expect(() => {
      const s = new Store(profile, () => 1)
      s.getUpdaters().update({name: 'rabbit'})
    }).toThrowError('beforeUpdate')

    expect(() => {
      const s = new Store(profile, () => '')
      s.getUpdaters().update({name: 'rabbit'})
    }).toThrowError('beforeUpdate')
    
    expect(() => {
      const s = new Store(profile, () => 0)
      s.getUpdaters().update({name: 'rabbit'})
    }).toThrowError('beforeUpdate')
  })

  it('Right way to new Store', () => {
    expect(() => new Store(profile)).toBeDefined()
    expect(() => new Store({profile})).toBeDefined()
    expect(() => new Store({profile, contact})).toBeDefined()
    expect(() => new Store({profile, inner: {contact}})).toBeDefined()
    expect(() => new Store({func: () => ({})})).toBeDefined()

    expect(() => new Store(profile, false)).toBeDefined()
    expect(() => new Store(profile, null)).toBeDefined()
    expect(() => new Store(profile, {})).toBeDefined()
    expect(() => new Store(profile, {msg: 'hi'})).toBeDefined()

    expect(() => new Store({profile: store1})).toBeDefined()
    expect(() => new Store({profile: store1, contact})).toBeDefined()

    expect(() => {
      const s = new Store(profile, (subState, state) => subState)
      s.getUpdaters().update({name: 'rabbit'})
    }).not.toThrow()
    
    expect(() => {
      const s = new Store(profile, () => undefined)
      s.getUpdaters().update({name: 'rabbit'})
    }).not.toThrow()

    expect(() => {
      const s = new Store(profile, () => false)
      s.getUpdaters().update({name: 'rabbit'})
    }).not.toThrow()

    expect(() => {
      const s = new Store(profile, (_, state) => state)
      s.getUpdaters().update({name: 'rabbit'})
    }).not.toThrow()

    expect(() => {
      const s = new Store(profile, (subState, state) => {
        Object.keys(subState).filter(key => typeof key === 'string').forEach(key => {
          subState[key] = subState[key].toUpperCase()
        })
        return subState
      })
      s.getUpdaters().update({name: 'rabbitoops'})

      expect(s.getState()).toEqual({name: 'RABBITOOPS', age: 21})
    }).not.toThrow()
    
    expect(() => {
      const s = new Store(profile, (subState, state) => {
        const ret = {}
        for (const key in subState) {
          if (!(key in state)) {
            return
          }
        }
        return subState
      })
      s.getUpdaters().update({name: 'older name'})
      s.getUpdaters().update({name: 'newer name', shouldNotBeAssigned: 'error'})

      expect(s.getState()).toEqual({name: 'older name', age: 21})
    }).not.toThrow()
  })

  it('store.getUpdaters()', () => {
    const profileActions = {
      getOlder: expect.any(Function),
      update: expect.any(Function)
    }
    const contactActions = {
      updateAll: expect.any(Function),
      update: expect.any(Function)
    }
    expect(actions1).toEqual(profileActions)
    expect(actions2).toEqual({$profile: profileActions, $contact: contactActions, optimize: expect.any(Function)})
    expect(actions3).toEqual({$profile: profileActions, $inner: {$contact: contactActions, optimize: expect.any(Function)}, optimize: expect.any(Function)})
  })

  it('store.getState()', () => {
    const profileState = {
      name: 'rabbit',
      age: 21
    }
    const contactState = {
      phone: 12345,
      email: 'rabbitmeow886@gmail.com',
      inc: 1
    }
    expect(store1.getState()).toEqual(profileState)
    expect(store2.getState()).toEqual({profile: profileState, contact: contactState})
    expect(store3.getState()).toEqual({profile: profileState, inner: {contact: contactState}})
  })

  it('Updaters update', () => {
    actions1.update({name: 'oops'})
    actions1.getOlder()
    expect(listener1.mock.calls).toEqual([[{name: 'oops', age: 21}], [{name: 'older oops', age: 22}]])

    actions2.$contact.update({email: 'example@gmail.com'})
    actions2.$contact.updateAll()
    expect(listener2.mock.calls).toEqual([
      [{
        profile: {name: 'rabbit', age: 21},
        contact: {phone: 12345, email: 'example@gmail.com', inc: 1}
      }],
      [{
        profile: {name: 'rabbit', age: 21},
        contact: {phone: 12345, email: 'example@gmail.com', inc: 2}
      }],
      [{
        profile: {name: 'rabbit', age: 21},
        contact: {phone: 911, email: 'example@gmail.com', inc: 2}
      }],
      [{
        profile: {name: 'rabbit', age: 21},
        contact: {phone: 911, email: 'example@gmail.com', inc: 101}
      }]
    ])

    actions3.$profile.update({name: 'oops'})
    actions3.$profile.update({age: 18})
    actions3.$inner.$contact.update({phone: 233, inc: 123})
    expect(listener3.mock.calls).toEqual([
      [{
        profile: {name: 'oops', age: 21},
        inner: {contact: {phone: 12345, email: 'rabbitmeow886@gmail.com', inc: 1}}
      }],
      [{
        profile: {name: 'oops', age: 18},
        inner: {contact: {phone: 12345, email: 'rabbitmeow886@gmail.com', inc: 1}}
      }],
      [{
        profile: {name: 'oops', age: 18},
        inner: {contact: {phone: 233, email: 'rabbitmeow886@gmail.com', inc: 123}}
      }]
    ])


    expect(() => actions1.update(1)).toThrowError('Store update: type is invalid')
    expect(() => actions1.update(null)).toThrowError('Store update: type is invalid')
    expect(() => actions1.update(undefined)).toThrowError('Store update: type is invalid')
    expect(() => actions1.update(() => {})).toThrowError('Store update: type is invalid')
    expect(() => actions1.update(true)).toThrowError('Store update: type is invalid')
    expect(() => actions1.update(false)).toThrowError('Store update: type is invalid')


    const parent = new Store(profile)
    const s =  new Store({profile: parent})
    expect(s.getState()).toEqual({profile: {name: 'rabbit', age: 21}})
    expect(s.getState().profile).toBe(parent.getState())

    s.getUpdaters().$profile.update({name: 'yes!'})
    expect(s.getState()).toEqual({profile: {name: 'yes!', age: 21}})
    expect(s.getState().profile).toBe(parent.getState())
  })

  it('Right way to optimize', () => {
    actions2.optimize((updaters, state) => {
      expect(updaters).toEqual({$profile: {getOlder: expect.any(Function), update: expect.any(Function)}, $contact: {updateAll: expect.any(Function), update: expect.any(Function)}})
      expect(state).toEqual({profile: {name: 'rabbit', age: 21}, contact: {phone: 12345, email: 'rabbitmeow886@gmail.com', inc: 1}})

      updaters.$profile.getOlder()
      updaters.$profile.getOlder()
      updaters.$profile.getOlder()
      updaters.$profile.getOlder()

      updaters.$contact.updateAll()
      updaters.$contact.update({email: 'meow!'})
    })
    const res1 = {profile: {name: 'older older older older rabbit', age: 25}, contact: {phone: 911, email: 'meow!', inc: 101}}
    expect(store2.getState()).toEqual(res1)
    actions2.optimize((updaters, state) => {
      expect(state).toEqual(res1)

      updaters.$profile.getOlder()
      updaters.$profile.getOlder()

      updaters.$contact.updateAll()
      updaters.$contact.update({email: 'yes'})
    })
    const res2 = {profile: {name: 'older older older older older older rabbit', age: 27}, contact: {phone: 911, email: 'yes', inc: 201}}
    expect(store2.getState()).toEqual(res2)

    expect(listener2.mock.calls.length).toBe(2)
  })

  it('Wrong way to optimize', () => {
    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      updaters.optimize(() => {})
    }).toThrowError('Runtime Error: You have not updated state')

    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      updaters.optimize()
    }).toThrowError('Store updaters.optimize: type is invalid')

    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      updaters.optimize(undefined)
    }).toThrowError('Store updaters.optimize: type is invalid')

    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      updaters.optimize(null)
    }).toThrowError('Store updaters.optimize: type is invalid')

    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      updaters.optimize(0)
    }).toThrowError('Store updaters.optimize: type is invalid')

    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      updaters.optimize({})
    }).toThrowError('Store updaters.optimize: type is invalid')


    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      updaters.optimize((_, state) => {
        updaters.optimize(() => {})
      })
    }).toThrowError('Runtime Error: You have already in optimize mode, avoid to rerun it.')

    expect(() => {
      const store = new Store({profile, contact})
      const updaters = store.getUpdaters()
      store.subscribe(() => {
        updaters.optimize((_, state) => {})
      })
      updaters.$profile.update({})
    }).toThrowError('Runtime Error: You cannot run updaters.optimize to update state in listeners.')
  })

  it('Listeners', () => {
    const anotherListener1 = jest.fn()
    store1.subscribe(anotherListener1)
    store1.getUpdaters().update({})
    store1.getUpdaters().update({})
    store1.getUpdaters().update({})
    expect(listener1.mock.calls.length).toBe(3)
    expect(anotherListener1.mock.calls.length).toBe(3)
    
    const actionWhenInListen = jest.fn(() => store1.getUpdaters().update({name: 'meow'}))
    store1.subscribe(actionWhenInListen)
    expect(() => store1.getUpdaters().update({age: 18})).toThrowError('Runtime Error: You cannot update state in listeners.')

    expect(() => store1.subscribe()).toThrowError('store.subscribe: type is invalid')
    expect(() => store1.subscribe(null)).toThrowError('store.subscribe: type is invalid')
    expect(() => store1.subscribe({})).toThrowError('store.subscribe: type is invalid')
    expect(() => store1.subscribe(true)).toThrowError('store.subscribe: type is invalid')
    expect(() => store1.subscribe(false)).toThrowError('store.subscribe: type is invalid')
    expect(() => store1.subscribe('abc')).toThrowError('store.subscribe: type is invalid')
    expect(() => store1.subscribe(123)).toThrowError('store.subscribe: type is invalid')
  })
})
