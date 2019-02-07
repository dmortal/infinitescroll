import React, {
	Component
} from 'react';
import config from './config';
import Message from './Message';

const MSG_HEIGHT = 130;//minimum message height based on the styling
const FETCH_THRESHOLD = 5;//message threshold which triggers additional messages fetch
const TOP_PADDING = 15;//accounting for styling padding of the container

const debounce = (fn, time) => {
  let timeout;

  return function() {
    const functionCall = () => fn.apply(this, arguments);

    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  }
}

class InfiniteScroll extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentOffset: 0,//offset value of current scroll
			isFetching: false,
			lBound: 0, //index of a first visible message
			listHeight: 0,//total visible height of the message list
			messages: [],//messages
			moveDelta: 0,//current scroll distance
			pageToken: null,//API pagination token
			removedChildrenOffset: [],//collection of all previous children heights
			scrolling: false,
			startY: 0,//initial tap/click position of the current scroll
			prevOffset: 0,//offset prior to current scrolling
			totalChildOffset: 0,//sum of all previous children heights
			visibleCount: 0, //number of visible messages
		};

		this.calculateListSize = this.calculateListSize.bind(this);
		this.hideChild = this.hideChild.bind(this);
		this.loadMessages = this.loadMessages.bind(this);
		this.onMove = this.onMove.bind(this);
		this.startScroll = this.startScroll.bind(this);
		this.stopScroll = this.stopScroll.bind(this);
	}
	componentDidMount(){
		this.calculateListSize();
		this.loadMessages();
		window.addEventListener('resize', this.calculateListSize);
		window.addEventListener('mousedown', this.startScroll);
		window.addEventListener('mouseup', this.stopScroll);
		window.addEventListener('mousemove', debounce(this.onMove, 10));
		window.addEventListener('touchstart', this.startScroll);
		window.addEventListener('touchend', this.stopScroll);
		window.addEventListener('touchmove', debounce(this.onMove, 10));
	}
	componentWillUnmount(){
		window.removeEventListener('resize', this.calculateListSize);
		window.removeEventListener('mousedown', this.startScroll);
		window.removeEventListener('mouseup', this.stopScroll);
		window.removeEventListener('touchstart', this.startScroll);
		window.removeEventListener('touchend', this.stopScroll);
		window.removeEventListener('touchmove', debounce(this.onMove, 10));
		window.removeEventListener('mousemove', debounce(this.onMove, 10));
	}
	/**
		Prefetches next messages batch when approaching a threshold on available messages
	*/
	componentDidUpdate(){
		const {isFetching, messages, lBound, visibleCount} = this.state;
		if(!isFetching && messages.length - (visibleCount+lBound) <= FETCH_THRESHOLD){
			this.loadMessages();
		}
	}
	/**
		Calculate number of visible messages based on the current screen size and a minimum message height
	*/
	calculateListSize(){
		const listHeight = this.element.getBoundingClientRect().height;
		this.setState({listHeight, visibleCount: Math.ceil(listHeight/MSG_HEIGHT)});
	}
	/**
		Shifts left bound of messages being displayed
		@param {Number} height - height of the child being "hidden" - used to update container padding
	*/
	hideChild(height){
		const {removedChildrenOffset, totalChildOffset} = this.state;
		//store message height in the collection
		removedChildrenOffset.push(height);
		this.setState({lBound: this.state.lBound+1, totalChildOffset: totalChildOffset + height, removedChildrenOffset});
	}
	/**
		Terminates scrolling and stores scrolled offset as previous offset
	*/
	stopScroll(){
		this.setState({scrolling: false, prevOffset: this.state.currentOffset});
	}
	/**
		Starts scrolling and captures initial event position used to determine scroll distance
	*/
	startScroll(e){
		const y = e.touches && e.touches.length>0?e.touches[0].pageY:e.pageY;
		this.setState({ scrolling: true, startY: y});
	}
	/**
		Move handler
	*/
	onMove(e){
		const y = e.touches && e.touches.length>0?e.touches[0].pageY:e.pageY;
		if(!this.state.scrolling){
			return;
		}
		const {lBound}= this.state,
			moveDelta = this.state.startY - y;
		let currentOffset = this.state.prevOffset - moveDelta,
			newLBound = lBound,
			removedChildrenOffset = this.state.removedChildrenOffset,
			totalChildOffset = this.state.totalChildOffset;

		//Prevent scrolling past first message
		if(currentOffset > 0 && lBound<=0){
			currentOffset = 0;
		}
		//Checking if message left bound should be shifted
		if(moveDelta < 0 && lBound>0 && currentOffset + MSG_HEIGHT + totalChildOffset > 0){
			newLBound--;
			totalChildOffset -= removedChildrenOffset.pop();
		}
		this.setState({moveDelta, currentOffset: currentOffset, totalChildOffset, lBound: newLBound, removedChildrenOffset});
	}
	/**
		Fetches messages from API endpoint
	*/
	loadMessages() {
		if(this.state.isFetching){
			return;
		}
		this.setState({
			isFetching: true
		}, () => {
			fetch(`${config.messagesApi}messages${this.state.pageToken!==null?`?pageToken=${this.state.pageToken}`:''}`)
				.then(response=>response.json())
				.then((results) => {
					const {pageToken, messages, count} = results;
					this.setState({
						pageToken,
						isFetching: false,
						count: count,
						messages: [
							...this.state.messages,
							...messages,
						],
					});
				})
				.catch((err) => {
					this.setState({
						error: err.message,
						isFetching: false,
					});
				})
		});
	}
	render() {
		const {isFetching, lBound, visibleCount, messages, currentOffset, moveDelta, totalChildOffset} = this.state;
		//Setting styles to perform scrolling as well as to account for hidden children offset
		const style = {
			transform: `translate3d(0px, ${currentOffset}px, 0px)`,
			paddingTop: `${totalChildOffset + TOP_PADDING}px`
		}

		const messagesComponents = messages.slice(lBound,visibleCount+lBound).map((msg, ind)=>{
			const isAbsolute = currentOffset<0 && ind === 0 && moveDelta < 0;
			return <Message {...msg} hideMe={this.hideChild} key={msg.id} index={ind} isAbsolute={isAbsolute} offset={currentOffset}/>;
		});

		return <ul className="MessageList" ref={r=>this.element = r} style={style}>
			{messagesComponents}
			{isFetching && (<li className="LoadingMsg">{config.fetchingMsg}</li>)}
		</ul>;
	}
}

export default InfiniteScroll;