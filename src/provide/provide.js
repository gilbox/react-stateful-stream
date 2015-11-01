import {map} from 'flyd';
import getDisplayName from '../get-display-name';
import {PROVIDER_CONTEXT_KEY} from '../stateful';

const identity = state => state;

export default function(React) {
  const {Component, PropTypes} = React;

  function provide(select=identity, selectEdit=identity) {

    return DecoratedComponent => class ProvideDecorator extends Component {
      static displayName = `Provide(${getDisplayName(DecoratedComponent)})`

      static contextTypes = {
        [PROVIDER_CONTEXT_KEY]: PropTypes.object.isRequired
      }

      constructor(props, context) {
        super(props, context);

        const {edit, atom} = context[PROVIDER_CONTEXT_KEY];

        this.state = { state: atom.getState() };
        this.edit = selectEdit(edit);
        this.atom = atom;
      }

      componentDidMount() {
        this.stream = map(newState => {
          const state = select(newState);
          if (state !== this.state.state) this.setState({state})
        }, this.atom.didSetState$);
      }

      componentWillUnmount() {
        this.stream.end(true);
      }

      render() {
        return (
          <DecoratedComponent
            {...this.props}
            {...this.state.state}
            {...this.edit} />
        )
      }
    }
  }

  class Provide extends Component {
    static defaultProps = {
      select: identity,
      selectEdit: identity,
    }

    static contextTypes = {
      [PROVIDER_CONTEXT_KEY]: PropTypes.object.isRequired,
    }

    constructor(props, context) {
      super(props, context);
      const state = context[PROVIDER_CONTEXT_KEY].atom.getState();
      this.state = { state };
    }

    componentDidMount() {
      const {atom} = this.context[PROVIDER_CONTEXT_KEY];
      const {select} = this.props;

      this.stream = map(newState => {
        const state = select(newState)
        if (state !== this.state.state) this.setState({state});
      }, atom.didSetState$);
    }

    componentWillReceiveProps(nextProps) {
      this._updateEdit(nextProps.selectEdit);
    }

    componentWillMount() {
      this._updateEdit(this.props.selectEdit);
    }

    componentWillUnmount() {
      this.stream.end(true);
    }

    _updateEdit(selectEdit) {
      const {atom, edit} = this.context[PROVIDER_CONTEXT_KEY];
      this.edit = selectEdit(edit);
    }

    render() {
      return this.props.children(this.state.state, this.edit)
    }
  }

  return {provide, Provide};
}
