# react-stateful-stream

re-examining modular state.

### decorator signature:

```
@stateful(initialState[, edit][, options])
```

### example: `initialState` as object, `edit` as a string

```
import React, {Component} from 'react';
import stateful from 'react-stateful-stream';

@stateful(
  { count: 0 },
  'edit')
class App extends Component {
  render() {
    const {count, edit} = this.props;

    const incrementCount =
      () => edit(state => ({count: state.count+1}));

    return <button onClick={incrementCount}>
      count: {count}
    </button>
  }
}
```

### example: `initialState` as a function, `edit` as a function

alternatively, our `initialState` argument can be a function
in which case it will receive `props` and `context` as arguments.

and, our `edit` argument can be a function in which case it will
receive `edit` as it's only argument

```
import React, {Component} from 'react';
import stateful from 'react-stateful-stream';
import u from 'updeep';
const immutable = u({});

const sub = (edit, ...path) =>
    transform => edit(u.updateIn(path, transform));

const increment = x => x+1;

@stateful(
  ({initialCount}) => immutable({
    count: initialCount || 0
  }),
  edit => ({
    editCount: sub(edit, 'count')
  }))
class App extends Component {
  render() {
    const {count, editCount} = this.props;

    return (
      <button
        onClick={() => editCount(increment)}>

        count: {count}

      </button>
    )
  }
}
```

### `@inject` decorator

    import {inject} from 'react-stateful-stream/inject';

Instead of passing `@stateful` props down the component
tree, we can use the `@inject` decorator to access
the state as long as the component is a decendant.

First, pass in an `options` object as the
third argument of `@stateful`, specifying a
`contextKey` property.

    @stateful(
      { count: 0 },
      edit => ({
        incrementCount: () => edit(state => ({...state, count: state.count+1}))
      }),
      { contextKey: 'countState' })
    class App extends Component {
      // ....
    }

Now wherever we'd like to inject the state,
add the `@inject` decorator, utilizing the same
key from before:

    @inject('countState')
    class Child extends Component {
      render() {
        const { count,
                incrementCount } = this.props.countState;

        return (
          <button onClick={incrementCount}>
            increment {count}
          </button>)
      }
    }

Notice that `@inject` will pass the props that are
normally passed along by `@stateful` in a new prop
with the same name as the `contextKey`.
It's done this way to avoid confusion about where our
various props are coming from.

### `<Inject />` component

    import {Inject} from 'react-stateful-stream/inject';

Similar to the `@inject` decorator, `<Inject />` allows us to inject state.
We specify the `contextKey` as a prop of `<Inject />`
and the only child of `<Inject />` is a function.
Into that function, `<Inject />` passes two arguments: `state` and `edit`.
We use destructuring to access `count` from `state` and `incrementCount`
from `edit`;

    class Child extends Component {
      render() {
        return (
          <Inject contextKey="countState">
            {({count}, {incrementCount}) =>
              <button onClick={incrementCount}>
                increment {count}
              </button>
            )}
          </Inject>
        )
      }
    }

*Note: `@inject` and `<Inject />` are  optional. If you don't import
`react-stateful-stream/inject`, they won't be included in your bundle.*


### `@provide` decorator

    import {provide} from 'react-stateful-stream/provide';

While `@inject` is about flexibility and ad-hoc state management, `@provide` is
about discipline and top-down state management. That's because
while `@inject` works with any number of `@stateful`s, `@provide`
only works with a single `@stateful` we designate the *provider*.
(It's directly inspired by the redux notion of a provider.)

We designate a `@stateful` to be a provider with the `provider`
property of the `options` (third) argument:

    @stateful(
      { count: 0 },
      edit => ({
        incrementCount: () => edit(state => ({...state, count: state.count+1}))
      }),
      { provider: true })
    class App extends Component {
      // ....
    }

`@provide` is a 3-arity function which takes *select* and
*selectState* for the first two arguments. (The third argument
is the component itself)

    @provide(
      ({count}) => ({count}),
      ({incrementCount}) => ({incrementCount}))
    class Child extends Component {
      render() {
        const {count, incrementCount} = this.props;

        return (
          <button onClick={incrementCount}>
            increment {count}
          </button>
        )
      }
    }

Note that our *select* argument above

    ({count}) => ({count})

has the following signature:

    (state) => ({....<sub-state>.....})

Use [reselect](https://github.com/rackt/reselect)
to create sophisticated, memoizing selectors.

Note that the *selectState* arg probably does not need to be
memoized since it will only be called once per component
instantiation.

Since the component above has no lifecycle methods other than
render, we can create it using a pure function instead of a `class`:

    const selectCount = ({count}) => ({count});
    const selectIncrementCount = ({incrementCount}) => ({incrementCount});

    const Child = provide(selectCount, selectIncrementCount)(
      ({count, incrementCount}) =>
        <button onClick={incrementCount}>
          increment {count}
        </button>)

You might have noticed that `provide` (or `@provide`) automatically
combines the result of *select* and *selectState* to create the props object.
Internally, here's what that looks like:

    render() {
      return (
        <DecoratedComponent
          {...this.props}
          {...this.state.state}
          {...this.edit} />
      )
    }

If this does not provide enough flexibility, use the `<Provide />`
component instead.

### `<Provide />` component

    import {Provide} from 'react-stateful-stream/provide';

`<Provide />` offers convenience, flexibility, and performance
optimizations (in certain situations) over `@provide`.

    const selectCount = ({count}) => ({count});
    const selectIncrementCount = ({incrementCount}) => ({incrementCount});

    const Child = () =>
      <Provide select={selectCount} selectEdit={selectIncrementCount}>
      {({count}, {incrementCount}) =>
        <button onClick={incrementCount}>
          increment {count}
        </button>
      }</Provide>

The `children` prop of `<Provide />` is a function that receives
`select(state)` and `selectState(edit)` args. Where `select`
is a function that you (optionally) pass in the `select` prop.
Likewise, `selectState` is a function that you (optionally) pass
in the `selectState` prop.
If either prop is omitted,
the identity function `x => x` is used.

*Note: `@provide` and `<Provide />` are  optional. If you don't import
`react-stateful-stream/provide`, they won't be included in your bundle.*

### `Atom`

We can import the `Atom` class and do something
with it.

```
import Atom from 'react-stateful-stream/Atom';
import {on} from 'flyd';

const atom = new Atom({count: 0});

on(state => console.log('changed: ', state.count), atom.didSetState$);

atom.updateState(state => ({count: state.count+1}));

// => "changed: 1"

```

## react-native support

Same as above, just change the imports by appending `/native`:

    import stateful from 'react-stateful-stream/native';
    import {inject, Inject} from 'react-stateful-stream/inject/native';
    import {provide, Provide} from 'react-stateful-stream/provide/native';
