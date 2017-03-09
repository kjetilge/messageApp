import 'bootstrap/dist/css/bootstrap.min.css';
//import styles from './index.scss';
import '../index.css'
import React from 'react';
import { Link } from 'react-router';
import { graphql, compose } from 'react-apollo';
import AuthService from '../utilities/auth';
import config from '../config';
import LoginButton from './loginButton'
//graphQl imports
import UpdateUserMutation from './graphQl/UpdateUserMutation.graphql'
import LoginMutation from './graphQl/LoginMutation.graphql'
import PublicChannelsQuery from './graphQl/PublicChannelsQuery.graphql'
import NewChannelsSubscription from './graphQl/NewChannelsSubscription.graphql'


class Channels extends React.Component {

  constructor(props) {
    super(props);
    this.onAuthenticated = this.onAuthenticated.bind(this);
    //this.startLogin = this.startLogin.bind(this);
    //this.logout = this.logout.bind(this);
    this.auth = new AuthService(config.auth0ClientId, config.auth0Domain);
    this.auth.on('authenticated', this.onAuthenticated);
    this.auth.on('error', console.log);
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  componentDidMount() {
    this.subscription = this.props.data.subscribeToMore({
      document: NewChannelsSubscription,
      variables: {
        subscriptionFilter: {
          isPublic: {
            eq: true
          }
        }
      },
      updateQuery: (prev, { subscriptionData }) => {
        return {
          viewer: {
            allChannels: {
              edges: [
                ...prev.viewer.allChannels.edges,
                {
                  node: subscriptionData.data.subscribeToChannel.value
                }
              ]
            }
          }
        };
      },
    });
  }

  onAuthenticated(auth0Profile, tokenPayload) {
    const that = this;
    this.props.loginUser({
      idToken: tokenPayload.idToken,
    }).then(res => {
      const scapholdUserId = res.data.loginUserWithAuth0.user.id;
      const profilePicture = auth0Profile.picture;
      const nickname = auth0Profile.nickname;
      return that.props.updateUser({
        id: scapholdUserId,
        picture: profilePicture,
        nickname: nickname
      });

      // Cause a UI update :)
      this.setState({});
    }).catch(err => {
      console.log(`Error updating user: ${err.message}`);
    });
  }

  render() {
    const updateView = () => {
      this.setState({});
    }

    return (
      <div>
        <h3>
          Channels
        </h3>
        {
          this.props.data.viewer ?
            <ul>
              {
                this.props.data.viewer.allChannels.edges.map(edge => (
                  <li key={edge.node.id}><Link to={`/channels/${edge.node.id}`}>{edge.node.name}</Link></li>
                ))
              }
            </ul> : null
        }

        <Link to="/createChannel">Create channel</Link>
        <LoginButton auth={this.auth} updateView={updateView}/>
      </div>
    )
  }
}

const ChannelsWithData = compose(
  graphql(PublicChannelsQuery, {
    options: (props) => {
      return {
        returnPartialData: true,
        variables: {
          wherePublic: {
            isPublic: {
              eq: true,
            }
          },
          orderBy: [
            {
              field: 'name',
              direction: 'ASC'
            }
          ]
        },
      };
    },
  }),
  graphql(LoginMutation, {
    props: ({ mutate }) => ({
      loginUser: (credential) => mutate({ variables: { credential: credential }}),
    })
  }),
  graphql(UpdateUserMutation, {
    props: ({ mutate }) => ({
      updateUser: (user) => mutate({ variables: { user: user }}),
    })
  })
)(Channels);

export default ChannelsWithData;
