import React, {Component} from 'react';
import stateful from 'react-stateful-stream';
import {inject, Inject} from 'react-stateful-stream/inject';

const increment = x => x+1;

@stateful(
  { count: 0,
    showChild: true },
  edit => ({
    toggleChild: () => edit(state => ({...state, showChild: !state.showChild})),
    incrementCount: () => edit(state => ({...state, count: state.count+1}))
  }),
  { contextKey: 'countState' })
class App extends Component {
  render() {
    const { count, showChild,
            toggleChild, incrementCount } = this.props;

    return <div>
      <button onClick={incrementCount}>
        count: {count}
      </button>

      <button onClick={toggleChild}>
        toggle child
      </button>

      {showChild && <Child />}

    </div>
  }
}

class Child extends Component {
  shouldComponentUpdate() { return false }
  render() {
    console.log('update Child');
    return (
      <div style={{border: '1px solid red', padding: '10px'}}>
        <div>Child</div>
        <GrandChild />
        <GrandChild2 />
      </div>
    )
  }
}

@inject('countState')
class GrandChild extends Component {
  render() {
    const {count, incrementCount} = this.props.countState;

    return (
      <div style={{border: '1px solid blue', padding: '10px', margin: '10px'}}>
        <div>Grand Child (inject decorator)</div>
        <button onClick={incrementCount}>
          count: {count}
        </button>
      </div>
    )
  }
}

class GrandChild2 extends Component {
  render() {
    const {count, incrementCount} = this.props;

    return (
      <div style={{border: '1px solid blue', padding: '10px'}}>
        <div>Grand Child 2 (Inject component)</div>
        <Inject contextKey={'countState'}>
        {({count, incrementCount}) =>
          <button onClick={incrementCount}>
            count: {count}
          </button>
        }</Inject>
      </div>
    )
  }
}

React.render(<App />, document.getElementById('example'));
