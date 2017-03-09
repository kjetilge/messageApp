/* File: makeApolloClient.js */

//import addGraphQLSubscriptions from './addGraphQLSubscriptions';
import ApolloClient, { createNetworkInterface } from 'apollo-client';

import {SubscriptionClient, addGraphQLSubscriptions} from 'subscriptions-transport-ws';
//import { Client } from 'subscriptions-transport-ws';

// creates a subscription ready Apollo Client instance
// Note that scaphldUrl expects the url without the http:// or wss://
function makeApolloClient(scapholdUrl) {
  const graphqlUrl = `https://${scapholdUrl}`;
  const websocketUrl = `wss://${scapholdUrl}`;

  // Create regular NetworkInterface by using apollo-client's API:
  const networkInterface = createNetworkInterface({uri: graphqlUrl});
  console.log("websocketUrl", websocketUrl)
  // Create WebSocket client
  const wsClient = new SubscriptionClient(websocketUrl, {
      reconnect: true,
      connectionParams: {/* Pass any arguments you want for initialization */}
  });

  networkInterface.use([{
    applyMiddleware(req, next) {
      // Easy way to add authorization headers for every request
      if (!req.options.headers) {
        req.options.headers = {};  // Create the header object if needed.
      }
      if (localStorage.getItem('scaphold_user_token')) {
        // assumes we have logged in and stored the returned user token in local storage
        req.options.headers.Authorization = `Bearer ${localStorage.getItem('scaphold_user_token')}`;
      }
      next();
    },
  }]);

  const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(networkInterface, wsClient);
  const clientGraphql = new ApolloClient({
    //networkInterface: networkInterface,
    networkInterface: networkInterfaceWithSubscriptions,
    initialState: {},
  });
  return clientGraphql;

}

export default makeApolloClient;
/* End of File: makeApolloClient.js */
