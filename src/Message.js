import React, {
	Component
} from 'react';
import moment from 'moment';
import config from './config';

class Message extends Component {
	constructor(props) {
		super(props);
		this.element = null;
	}
	componentDidUpdate(){
		if(this.element.getBoundingClientRect().bottom < 0){
			this.props.hideMe(this.element.getBoundingClientRect().height);
		}
	}
	render() {
		const { id, author, updated, content } = this.props;
		return <li className="Message" id={id} ref={ref=>this.element = ref}>
				<div className="MessageContent">
					<header className="MessageHeader">
						{author && author.photoUrl && (<img className="AuthorThumbnail" src={config.messagesApi+author.photoUrl} alt={config.authorImgAlt}/>)}
						<div>
							<h6>{author.name}</h6>
							{updated && (<span>{moment(updated).fromNow()}</span>)}
						</div>
					</header>
					<p>{content}</p>
				</div>
			</li>;
	}
}

export default Message;