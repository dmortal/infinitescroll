import React, {
	Component
} from 'react';
import moment from 'moment';
import config from './config';

const MOVE_THRESHOLD = 200;

class Message extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isDragging: false,
			posX: 0,
			startX: 0
		};
		this.element = null;
		this.startDrag = this.startDrag.bind(this);
		this.stopDrag = this.stopDrag.bind(this);
		this.onMove = this.onMove.bind(this);
	}
	componentDidMount(){
		this.element.addEventListener('mousedown', this.startDrag);
		this.element.addEventListener('mouseup', this.stopDrag);
		this.element.addEventListener('mousemove', this.onMove);
		this.element.addEventListener('touchstart', this.startDrag);
		this.element.addEventListener('touchend', this.stopDrag);
		this.element.addEventListener('touchmove', this.onMove);
	}
	componentWillUnmount(){
		this.element.removeEventListener('mousedown', this.startDrag);
		this.element.removeEventListener('mouseup', this.stopDrag);
		this.element.removeEventListener('mousemove', this.onMove);
		this.element.removeEventListener('touchstart', this.startDrag);
		this.element.removeEventListener('touchend', this.stopDrag);
		this.element.removeEventListener('touchmove', this.onMove);
	}
	startDrag(e){
		const x = e.touches && e.touches.length>0?e.touches[0].pageX:e.pageX;
		this.setState({isDragging: true, startX: x});
	}
	stopDrag(){
		this.setState({isDragging: false, posX: 0, startX: 0});
	}
	onMove(e){
		const x = e.touches && e.touches.length>0?e.touches[0].pageX:e.pageX;
		if (!this.state.isDragging || !this.props.isDraggable) return;
		const moveDelta = x - this.state.startX;
		if(Math.abs(moveDelta)>MOVE_THRESHOLD){
			this.props.deleteMe(this.props.id);
		}else{
			this.setState({
		      posX: moveDelta
		    })
		}
	    e.stopPropagation()
	    e.preventDefault()
	}
	componentDidUpdate(){
		if(this.element.getBoundingClientRect().bottom < 0){
			this.props.hideMe(this.element.getBoundingClientRect().height);
		}
	}
	render() {
		const { id, author, updated, content } = this.props;
		const style = {
			transform: `translate3d(${this.state.posX}px, 0px, 0px)`
		}
		return <li className="Message" id={id} style={style} ref={ref=>this.element = ref}>
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