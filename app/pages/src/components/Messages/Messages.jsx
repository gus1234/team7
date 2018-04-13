import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import { Comment } from 'semantic-ui-react';
import { getUser, onMessage } from '../../../../sockets/client';
import Markdown from '../Markdown';
import UrlMeta from '../UrlMeta';

@inject('usersStore', 'currentUserStore', 'chatsStore')
@observer
class Messages extends React.Component {
    componentDidMount() {
        this.scroll();
        const users = [];
        this.props.messages.forEach(({ authorUserId }) => {
            if (!this.props.usersStore.getUsername(authorUserId) && !users.includes(authorUserId)) {
                users.push(authorUserId);
                getUser({ userId: authorUserId });
            }
        });

        onMessage((message) => {
            if (message.authorUserId === this.props.currentUserStore.user.userId
                && this.props.chatId === message.chatId) {
                this.scroll();
            }
        });
    }

    componentWillUpdate(props) {
        if (props.chatId !== this.props.chatId) {
            const messages = ReactDOM.findDOMNode(this).parentElement;
            this.props.chatsStore.setScrollHeight(messages.scrollTop, this.props.chatId);
        }
    }

    componentDidUpdate(props) {
        if (props.chatId !== this.props.chatId) {
            this.scroll(this.props.chatsStore.chatsById.get(this.props.chatId).scrollHeight);
        }
    }

    scroll(value) {
        const messages = ReactDOM.findDOMNode(this).parentElement;
        messages.scrollTop = value !== undefined ? value : messages.scrollHeight;
    }

    render() {
        const { usersStore } = this.props;
        return (
            <Comment.Group>
                {this.props.messages.map(message => (
                    <Comment key={message.messageId}>
                        <Comment.Avatar src={usersStore.getAvatar(message.authorUserId)} />
                        <Comment.Content>
                            <Comment.Author as="a">
                                {usersStore.getUsername(message.authorUserId)}
                            </Comment.Author>
                            <Comment.Metadata>
                                <div>{moment(message.timestamp).format('HH:mm')}</div>
                            </Comment.Metadata>
                            <Comment.Text style={{ minHeight: '1em' }}>
                                <Markdown source={message.content} needFormat />
                            </Comment.Text>
                            <UrlMeta text={message.content} />
                        </Comment.Content>
                    </Comment>
                ))}
            </Comment.Group>
        );
    }
}

export default Messages;
