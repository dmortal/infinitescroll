export default {
	appHeader: 'Messages',
	fetchingMsg: 'Loading more messages',
	authorImgAlt: 'Photo of the author',
	messagesApi: 'https://message-list.appspot.com/',
	debounce: (fn, time) => {
	  let timeout;

	  return function() {
	    const functionCall = () => fn.apply(this, arguments);

	    clearTimeout(timeout);
	    timeout = setTimeout(functionCall, time);
	  }
	}
}