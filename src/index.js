import React from 'react';
import { render } from 'react-dom';

//import { AppContainer } from 'react-hot-loader';
import App from './components/app.js';
import { ApolloProvider } from 'react-apollo';
import { Router, Route, browserHistory } from 'react-router'
import Messages from './components/messages';
import CreateChannel from './components/createChannel';
import makeApolloClient from './utilities/makeApolloClient';
import config from './config';

const client = makeApolloClient(config.scapholdUrl);

const root = (
    <ApolloProvider client={client}>
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <Route path="createChannel" component={CreateChannel}></Route>
          <Route path="/channels/:channelId" component={Messages}></Route>
        </Route>
      </Router>
    </ApolloProvider>
)

//const test = <h1>TEST</h1>

render( root , document.getElementById('root'));

/*
if (module.hot) {
  module.hot.accept('./components/app.js', () => {
    const App = require('./components/app.js').default;
    render(
      <AppContainer>
        <ApolloProvider client={client}>
          <Router history={browserHistory}>
            <Route path="/" component={App}>
              <Route path="login" component={Login}></Route>
              <Route path="/channels/:channelId" component={Messages}></Route>
            </Route>
            <Route path="/createChannel" component={CreateChannel}></Route>
          </Router>
        </ApolloProvider>
      </AppContainer>,
      document.querySelector("#app")
    );
  });
}*/
