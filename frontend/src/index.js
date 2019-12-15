import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
import { unregister } from './scenes/registerServiceWorker';

import { HashRouter } from 'react-router-dom';
import './scenes/assets/base.css';
import Main from './scenes/Pages/Main';
import configureStore from './scenes/config/configureStore';
import { Provider } from 'react-redux';
import axios from 'axios';

const store = configureStore();
const rootElement = document.getElementById('root');

const App = Component => {
  ReactDOM.render(
    <Provider store={store}>
      <HashRouter>
        <Component />
      </HashRouter>
    </Provider>,
    rootElement
  );
};

App(Main);

if (module.hot) {
  module.hot.accept('./scenes/Pages/Main', () => {
    const NextApp = require('./scenes/Pages/Main').default;
    App(NextApp);
  });
}
unregister();
