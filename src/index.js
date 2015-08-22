import React, {Component} from 'react';
import Atom from './Atom';
import {on} from 'flyd';

export default function stateful(state, editPropName='edit') {
  return DecoratedComponent => class StatefulDecorator extends Component {
    static displayName = `Stateful(${getDisplayName(DecoratedComponent)})`;
    static DecoratedComponent = DecoratedComponent;
    
    constructor(props, context) {
      super(props, context);
      this.state = { state, atom: new Atom(state) };
    }
    
    componentWillMount() {
      const {atom} = this.state;
      
      // connect atom updates to component's state
      on(state => this.setState({state}), atom.didSetState$);
    }
    
    componentDidUnmount() {
      this.state.atom.destroy();
    }
    
    render() {
      const {atom, state} = this.state;
      
      return (
        <DecoratedComponent 
          {...this.props}
          {...state}
          {...{[editPropName]: atom.updateState}} />
      );
    }
  };
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}