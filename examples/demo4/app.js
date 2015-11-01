import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import stateful from 'react-stateful-stream';
import {provide, Provide} from 'react-stateful-stream/provide';

const increment = x => x+1;

@stateful(
  { count: 0,
    showChild: true },
  edit => ({
    toggleChild: () => edit(state => ({...state, showChild: !state.showChild})),
    incrementCount: () => edit(state => ({...state, count: state.count+1}))
  }),
  { provider: true })
@provide()
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

const selectCount = ({count}) => ({count});
const selectIncrementCount = ({incrementCount}) => ({incrementCount});

// here we use provide decorator in functional way.
const GrandChild =
  provide(selectCount, selectIncrementCount)(
    ({count, incrementCount}) =>
      <div style={{border: '1px solid blue', padding: '10px', margin: '10px'}}>
        <div>Grand Child (provide decorator)</div>
        <button onClick={incrementCount}>
          count: {count}
        </button>
      </div>);

const GrandChild2 = () =>
  <div style={{border: '1px solid blue', padding: '10px'}}>
    <div>Grand Child 2 (Provide component)</div>
    <Provide select={selectCount} selectEdit={selectIncrementCount}>
    {({count}, {incrementCount}) =>
      <button onClick={incrementCount}>
        count: {count}
      </button>
    }</Provide>
  </div>;

ReactDOM.render(<App />, document.getElementById('example'));
