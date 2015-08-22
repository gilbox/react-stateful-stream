import {stream} from 'flyd';

export default class Atom {
  constructor(state) {
    this.state = state;

    // directly-updated state, used to update "watcher" App component
    this.didSetState$ = stream();

    // used to indicate "user" update
    this.didUpdateState$ = stream();
    
    this.updateState = ::this.updateState;
    this.getState = ::this.getState;
    this.silentlyUpdateState = ::this.silentlyUpdateState;
  }

  _setState(state) {
    return this.didSetState$(this.state = state).val;
  }

  silentlyUpdateState(transform) {
    return this._setState(transform(this.state));
  }

  updateState(transform) {
    return this.didUpdateState$(this._setState(transform(this.state))).val;
  }

  getState() {
    return this.state;
  }
  
  destroy() {
    this.state = null;
    this.didSetState$.end(true);
    this.didUpdateState$.end(true);
  }
}
