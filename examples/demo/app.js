import React, {Component} from 'react';
import stateful from 'react-stateful-stream';

const increment = x => x+1;

@stateful(
  { count: 0},
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

React.render(<App />, document.getElementById('example'));
