import React, {Component, PropTypes} from 'react';
import {map} from 'flyd';
import {getDisplayName} from './index';

export function inject(contextKey) {
  return DecoratedComponent => class InjectDecorator extends Component {
    static displayName = `Inject(${getDisplayName(DecoratedComponent)})`

    static contextTypes = {
      [contextKey]: PropTypes.object.isRequired
    }

    constructor(props, context) {
      super(props, context);

      const {edit, atom} = context[contextKey];

      this.state = { state: atom.getState() };
      this.edit = edit;
      this.atom = atom;
    }

    componentDidMount() {
      this.stream = map(state => this.setState({state}), this.atom.didSetState$);
    }

    componentWillUnmount() {
      this.stream.end(true);
    }

    render() {
      return (
        <DecoratedComponent
          {...this.props}
          {...{[contextKey]: {
            ...this.state.state,
            ...this.edit} }} />
      )
    }
  }
}

export class Inject extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {atom} = this._reactInternalInstance._context[this.props.contextKey];
    this.stream = map(state => this.setState({state}), atom.didSetState$);
  }

  componentWillUnmount() {
    this.stream.end(true);
  }

  render() {
    const {contextKey} = this.props;
    const {atom, edit} = this._reactInternalInstance._context[contextKey];

    return this.props.children({
      ...atom.state,
      ...edit
    })
  }
}
