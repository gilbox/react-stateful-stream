# react-stateful-stream

re-examining modular state.

### decorator signature:

```
@stateful(initialState, editPropName='edit')
```

### example: `initialState` as object

```
import React, {Component} from 'react';
import stateful from 'react-stateful-stream';

@stateful({
  count: 0
}, 'edit')
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

### example: `initialState` as function

alternatively, our `initialState` argument can be a function 
in which case it will receive `props` and `context` as arguments

```
import React, {Component} from 'react';
import stateful from 'react-stateful-stream';

const increment = x => x+1;

@stateful(props => ({
  count: props.count
}), 'edit')
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


### `Atom`

you can also import the `Atom` class and do something
with it.

```
import Atom from 'react-stateful-stream/Atom';
import {on} from 'flyd';

const atom = new Atom({count: 0});

on(state => console.log('changed: ', state.count), atom.didSetState$);

atom.updateState(state => {count: state.count+1});

// => "changed: 1"

```
