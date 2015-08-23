# react-stateful-stream

re-examining modular state.

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
