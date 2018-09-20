chrome.webNavigation.onCompleted.addListener(function() {
      // alert("This is my favorite website!");
      chrome.tabs.executeScript({file: 'js/script.js'});
},  {
		url:[
			{ urlMatches : 'https://trello.com/' },
			{ urlMatches : 'https://trello.com/1/*' }
		]
	}
);