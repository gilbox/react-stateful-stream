import Atom from './Atom';
import {on} from 'flyd';
import getDisplayName from './get-display-name';

export const PROVIDER_CONTEXT_KEY = '__stateful__';

export default function statefulFactory(React) {
  const {Component, PropTypes} = React;

  return function stateful(initialState, edit, options={}) {
    return DecoratedComponent => {
      class StatefulDecorator extends Component {
        static displayName = `Stateful(${getDisplayName(DecoratedComponent)})`;
        static DecoratedComponent = DecoratedComponent;
        static contextTypes = options.contextTypes;

        constructor(props, context) {
          super(props, context);

          const state = typeof initialState === 'function' ?
            initialState(props,context) : initialState;

          const atom = new Atom(state);

          this.edit = {};

          if (edit) {
            if (typeof edit === 'string') {
              this.edit = {[edit]: atom.updateState};
            } else if (typeof edit === 'function') {
              this.edit = edit(atom.updateState);
            }
          }

          this.state = { state, atom, edit: this.edit };
        }

        componentDidMount() {
          const {atom} = this.state;

          // connect atom updates to component's state
          on(state => this.setState({state}), atom.didSetState$);
        }

        componentWillUnmount() {
          this.state.atom.destroy();
        }

        render() {
          const {atom, state} = this.state;

          if (options.provider) {
            return <DecoratedComponent {...this.props} />
          }

          return (
            <DecoratedComponent
              atom={atom}
              {...this.props}
              {...state}
              {...this.edit} />
          );
        }
      };

      const contextKey = options.provider ?
        PROVIDER_CONTEXT_KEY : options.contextKey;

      if (contextKey) {
        StatefulDecorator.childContextTypes = {
          [contextKey]: React.PropTypes.object
        }

        StatefulDecorator.prototype.getChildContext = function() {
          return {
            [contextKey]: this.state
          };
        }
      }

      if (options.dontRender || options.provider) {
        StatefulDecorator.prototype.shouldComponentUpdate =
          function() { return false };
      }

      return StatefulDecorator;
    }
  }
}
