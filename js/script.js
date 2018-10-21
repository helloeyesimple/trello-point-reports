var timer;
var boardArr = {};
var arr = {
	title: '',
	data: [],
	results: []
};

function loadStorageScript(){
	chrome.storage.local.get('board', function(result) {
    	boardArr = result.board;
    });
}

function getCardDetail(new_arr){
	var date = "";
	setTimeout(function(){
		if($(".window .window-wrapper").html() != ""){
			$(".window .js-list-actions .phenom.mod-attachment-type").each(function(){
				
				// check if the url is matched
				var activity = $(this).find('.phenom-desc').contents().eq(1).text();
				var found = activity.match(/to Done/g);
				if(found){
					date = $(this).find('.phenom-meta .date').attr('dt');
					new_arr.date = date;

					$(".window .js-close-window")[0].click();
					
					// only push new data
					var flag = false;
					arr.data.forEach(function(item,index){
						if(item.id == new_arr.id){
							flag = true;
						}
					});

					if(!flag){
						arr.data.push(new_arr);
					}
					saveBoard();

					return true;
				}
			});
		}
	}, 2000);
}

function resetValue(){
	loadStorageScript();
	boardArr = {};
	arr = {
		title: '',
		data: [],
		results: []
	};
}

function syncBoards(){
	var n = 0;
	$(".boards-page-board-section-list-item").each(function(){
		var target = $(this).find('a');
		var url = window.location.origin+$(target).attr('href');
		var el = this;
		console.log(url);

		setTimeout(function(){
			var win = window.open(url, '_blank');
			win.focus;

			// chrome.tabs.create('tab'+n, {
			// 	url: url
			// }, function(){
			// 	console.log('new tab');
			// });

			win.onload = function(){
				savePoint();

				// chrome.tabs.executeScript({
			 //        code: 'savePoint()'
			 //    });
			};

			// $(target)[0].click();
			// setTimeout(function(){
				// savePoint();
			// 	window.history.back();
			// }, 5000);
		}, n*10000);
		n++;
	});
}

function savePoint(method){
	console.log('save point');
	resetValue();

	$("#board .js-list").each(function(){
		if($(this).find('.list-header-name-assist').text() == 'Done'){

			var n = 0;
			$(this).find(".list-card").each(function(){
				var point = parseInt($(this).find('.list-card-details .badges .js-plugin-badges .badge-text').text());

				if(point && point != ''){
					var url = window.location.origin+$(this).attr('href');

					var id = $(this).find('.list-card-details .list-card-title .card-short-id').text().match(/\d+/g)[0];
					var title = $(this).find('.list-card-details .list-card-title').contents().eq(1).text();
					var member_id = $(this).find('.list-card-details .list-card-members .member-initials').eq(0).text();
					var member = $(this).find('.list-card-details .list-card-members .member-initials').attr('title');
					var date = "";

					// setup new array for new data
					var new_arr = {
						id: id,
						url: url,
						title: title,
						member_id: member_id,
						member: member,
						point: point,
						date: date
					};

					// set date from card details
					var el = this;
					setTimeout(function(){
						$(el)[0].click();
						date = getCardDetail(new_arr);
					}, n*5000);
					n++;
				}
			});

			if(n == 0 && method == 'with_close'){ 
				console.log('No data found! Window now closing');
				window.close(); 
			}
		}
	});
}

function calculatePoint(){

	// calculate total points
	var total = [];
	arr.data.forEach(function(item,index){
		total[item.member_id] = total[item.member_id] || 0;
		total[item.member_id] = parseInt(total[item.member_id]) + parseInt(item.point);
	});
	arr.results = total;
	saveBoard();
	
}

function saveBoard(){
	// get board and save
	var slug = $(".board-header-btn-text").contents().eq(0).text().toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'');
	var boardTitle = $(".board-header-btn-text").contents().eq(0).text();
	arr.title = boardTitle;

	boardArr = boardArr || new Object;
	eval('boardArr.'+slug+' = arr');
	console.log(boardArr);

	chrome.storage.local.set({board: boardArr}, function(){
		// console.log(boardArr);
	});	
}

$(document).ready(function(){
	loadStorageScript();
});