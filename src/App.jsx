import React from 'react';
import Game from './Game.jsx';

class Boundary extends React.Component {
  constructor(p) {
    super(p);
    this.state = { err: null };
  }
  static getDerivedStateFromError(e) {
    return { err: e };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="grid place-items-center p-6 text-center" style={{ height: '100dvh', background: 'linear-gradient(#2A1F52,#181428)', fontFamily: "'Fredoka','Comic Sans MS',ui-rounded,system-ui,sans-serif" }}>
          <div>
            <div className="text-5xl mb-2">🧸</div>
            <div className="font-bold mb-1" style={{ color: '#ECE7FA' }}>Oops, Tiny Town tripped!</div>
            <div className="text-xs mb-4" style={{ color: '#9D95C0', maxWidth: 260 }}>{String((this.state.err && this.state.err.message) || this.state.err)}</div>
            <button onClick={() => this.setState({ err: null })} className="rounded-2xl px-5 py-3 text-sm font-bold active:scale-95" style={{ background: '#A24BFF', color: '#FFF' }}>Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <Boundary>
      <Game />
    </Boundary>
  );
}
