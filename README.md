# react-stateful-stream

re-examining modular state.

### decorator signature:

```
@stateful(initialState[, edit])
```

### example: `initialState` as object

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

### example: `initialState` as function, `edit` as a function

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
In that function, `<Inject />` passes an object as a single argument whose
properties are the props that `@stateful` usually passes
into its decorated component.

    class Child extends Component {
      render() {
        return (
          <Inject contextKey="countState">
            {({count, incrementCount} =>
              <button onClick={incrementCount}>
                increment {count}
              </button>
            )}
          </Inject>
        )
      }
    }

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
