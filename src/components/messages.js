import React from 'react';
import { graphql, compose } from 'react-apollo';

//graphQl imports
import ChannelMessagesQuery from './graphQl/ChannelMessagesQuery.graphql'
import NewMessagesSubscription from './graphQl/NewMessagesSubscription.graphql'
import CreateMessageMutation from './graphQl/CreateMessageMutation.graphql'
import LoggedInUserQuery from './graphQl/LoggedInUserQuery.graphql'


class Messages extends React.Component {

  constructor(props: any) {
    super(props);
    this.onNewMessageChange = this.onNewMessageChange.bind(this);
    this.submitMessage = this.submitMessage.bind(this);
    this.state = {
      newMessage: ''
    };
  }

  subscribeToNewMessages() {
    this.subscription = this.props.data.subscribeToMore({
      document: NewMessagesSubscription,
      variables: {
        subscriptionFilter: {
          channelId: {
            eq: this.props.params ? this.props.params.channelId : null
          }
        }
      },
      updateQuery: (prev, { subscriptionData }) => {
        const newEdges = [
          ...prev.getChannel.messages.edges,
          {
            node: {
              ...subscriptionData.data.subscribeToMessage.value,
            }
          }
        ];
        return {
          getChannel: {
            messages: {
              edges: newEdges,
            }
          }
        };
      },
    });
  }

  componentWillReceiveProps(newProps) {
    if (
      !newProps.data.loading &&
      newProps.data.getChannel
    ) {
      if (
        !this.props.data.getChannel ||
        newProps.data.getChannel.id !== this.props.data.getChannel.id
      ) {
        // If we change channels, subscribe to the new channel
        this.subscribeToNewMessages();
      }
    }
  }

  onNewMessageChange(e) {
    this.setState({
      newMessage: e.target.value,
    });
  }

  submitMessage(e) {
    if (e) {
      e.preventDefault();
    }
    const that = this;
    this.props.createMessage({
      content: this.state.newMessage,
      channelId: this.props.data.getChannel.id,
      authorId: this.props.loggedInUser ? this.props.loggedInUser.id : undefined
    }).then(() => {
      that.setState({
        newMessage: ''
      });
    });
  }

  render() {
    return this.props.data.getChannel ?
      (
        <div>
          <div>
            <h3>{this.props.data.getChannel.name}</h3>
          </div>
          <div>
            <ul>
              {
                this.props.data.getChannel.messages.edges.map(edge => (
                  <li key={edge.node.id}>
                    <div>
                      {
                        edge.node.author && edge.node.author.picture ?
                          <img
                            style={{ width: '30px', height: '30px', borderRadius: '15px', marginLeft: '-36px', marginTop: '10px' }}
                            src={edge.node.author.picture}
                            alt="author"
                          /> :
                          null
                      }
                      <div>
                        <div>
                          {
                            <h6>
                              {
                                edge.node.author ?
                                  (edge.node.author.nickname || edge.node.author.username) :
                                  'Anonymous'
                              }
                            </h6>
                          }
                          {
                            <span className="text-muted">
                            {new Date(edge.node.createdAt).toISOString().substr(11, 5)}
                            </span>
                          }
                        </div>
                        <div>
                          {edge.node.content}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
          <div>
            <form onSubmit={this.submitMessage}>
              <div className="input-group">
                <input value={this.state.newMessage} onChange={this.onNewMessageChange} type='textarea' placeholder={`Message ${this.props.data.getChannel.name}`} className="form-control" />
                <span className="input-group-btn">
                  <button className="btn btn-info" type="submit" onClick={this.submitMessage}>Send!</button>
                </span>
              </div>
            </form>
          </div>
        </div>
      ) : <h5>Loading...</h5>;
  }
}

const MessagesWithData = compose(
  graphql(ChannelMessagesQuery, {
    options: (props) => {
      const channelId = props.params ? props.params.channelId : null;
      return {
        returnPartialData: true,
        variables: {
          channelId,
          messageOrder: [
            {
              field: 'createdAt',
              direction: 'ASC'
            }
          ],
        },
      };
    },
  }),
  graphql(LoggedInUserQuery, {
    props: ({ data }) => ({
      loggedInUser: data.viewer ? data.viewer.user : null
    })
  }),
  graphql(CreateMessageMutation, {
    props: ({ mutate }) => ({
      createMessage: (message) => mutate({ variables: { message: message } }),
    }),
  }),
)(Messages);

export default MessagesWithData;
