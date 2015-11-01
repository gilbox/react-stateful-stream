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

        this.state = { selectedState: select(atom.getState()) };
        this.selectedEdit = selectEdit(edit);
        this.atom = atom;
      }

      componentDidMount() {
        this.stream = map(newState => {
          const selectedState = select(newState);
          if (selectedState !== this.state.selectedState) this.setState({selectedState})
        }, this.atom.didSetState$);
      }

      componentWillUnmount() {
        this.stream.end(true);
      }

      render() {
        return (
          <DecoratedComponent
            {...this.props}
            {...this.state.selectedState}
            {...this.selectedEdit} />
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
      const selectedState = props.select(
        context[PROVIDER_CONTEXT_KEY].atom.getState()
      );
      this.state = { selectedState };
    }

    componentDidMount() {
      const {atom} = this.context[PROVIDER_CONTEXT_KEY];
      const {select} = this.props;

      this.stream = map(newState => {
        const selectedState = select(newState)
        if (selectedState !== this.state.selectedState) this.setState({selectedState});
      }, atom.didSetState$);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.selectEdit !== nextProps.selectEdit) {
        this._updateEdit(nextProps.selectEdit);
      }
    }

    componentWillMount() {
      this._updateEdit(this.props.selectEdit);
    }

    componentWillUnmount() {
      this.stream.end(true);
    }

    _updateEdit(selectEdit) {
      const {atom, edit} = this.context[PROVIDER_CONTEXT_KEY];
      this.selectedEdit = selectEdit(edit);
    }

    render() {
      return this.props.children(this.state.selectedState, this.selectedEdit)
    }
  }

  return {provide, Provide};
}
