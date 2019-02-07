import React, { Component } from 'react';
import InfiniteScroll from './InfiniteScroll';
import './App.scss';
import config from './config';

class App extends Component {
  render() {
    return (
      <div className="App">
          <header className="App-Header">
            <a
              className="App-HeaderMenu"
              href="#AppHeader"
              target="_blank"
              rel="noopener noreferrer"
            >
            </a>
            <h2 className="App-HeaderTitle">{config.appHeader}</h2>
          </header>
        <InfiniteScroll />
      </div>
    );
  }
}

export default App;
