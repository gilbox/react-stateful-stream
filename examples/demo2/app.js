import React, {Component} from 'react';
import ReactDOM from 'react-dom';
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

ReactDOM.render(<App />, document.getElementById('example'));
