var boardArr = {};

function formatNiceDate(date) {
	var date = new Date(date);

	var monthNames = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"
	];

	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();

	return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function loadStorage(){
	boardArr = {};
	chrome.storage.local.get('board', function(result) {
    	boardArr = result.board;
    	console.log(boardArr);
    	renderData();
    });
}

function removeStorage(){
	chrome.storage.local.set({board: null}, function(result) {
    	
    });
}

function renderSummary(){
	var total =[];

	var html = "<p>";

	$('.user-data:visible').each(function(){
		total[$(this).attr('data-user-id')] = total[$(this).attr('data-user-id')] || [];
		total[$(this).attr('data-user-id')].name = $(this).find('.user-data-name').text();

		total[$(this).attr('data-user-id')].point = total[$(this).attr('data-user-id')].point || 0;
		total[$(this).attr('data-user-id')].point += parseInt($(this).find('.user-data-point').text())
	});

	Object.keys(total).forEach(function(item, index){
		html += total[item].name+": "+total[item].point+" point(s) <br />";
	});
	html += "</p>";

	$("#summary").html(html);
}

function renderProjects(){
	var projects = [];
	$("*[data-project]").each(function(){
		var id = $(this).attr('data-project');
		var title = $(this).attr('data-project-title');
		projects[id] = title;
	});

	Object.keys(projects).forEach(function(item){
		$("#project-list").append("<option value='"+item+"'>"+projects[item]+"</option>")
	});
}

function renderUsers(){
	var users = [];
	$(".user-data").each(function(){
		var id = $(this).attr('data-user-id');
		var title = $(this).attr('data-user-name');
		users[id] = title;
	});

	Object.keys(users).forEach(function(item){
		$("#user-list").append("<option value='"+item+"'>"+users[item]+"</option>")
	});
}

function renderData(){
	var html = '';

	Object.keys(boardArr).forEach(function(item, index){
		html += '<div data-project="'+item+'" data-project-title="'+boardArr[item].title+'">'+
		'<p class="mb-0 p-2 bg-primary text-white">'+boardArr[item].title+'</p>'+
		'<table class="table">'+
			'<thead>'+
				'<tr>'+
					'<th>People</th>'+
					'<th>Point</th>'+
					'<th>Finish Date</th>'+
				'</tr>'+
			'</thead>'+
			'<tbody>';

				boardArr[item].data.forEach(function(it, idx){

					var date = (it.date != "") ? formatNiceDate(it.date) : "";
					html += '<tr class="user-data" data-date="'+it.date+'" data-user-id="'+it.member_id+'" data-user-name="'+it.member+'">'+
						'<td class="user-data-name">'+it.member+'</td>'+
						'<td class="user-data-point">'+it.point+'</td>'+
						'<td class="user-data-date">'+date+'</td>'+
					'</tr>';
				});
			
			html += '</tbody>'+
		'</table></div>';
	});

	$("#render").html(html);

	renderSummary();
	renderProjects();
	renderUsers();
}

$(document).ready(function(){
	// init
	loadStorage();
	
	// on storage changes
	chrome.storage.onChanged.addListener(function(){
		loadStorage();
	});

	// on clear all storage
	$("#remove_sync").click(function(e){
		e.preventDefault();
		removeStorage();
	});

	// on sync current board
	$("#sync").click(function(e){
		e.preventDefault();
		boardArr = {};

		chrome.tabs.executeScript({
	        // code: '(' +  + ')();' //argument here is a string but function.toString() returns function's code
	        code: 'savePoint()'
	    }, (results) => {
	        //Here we have just the innerHTML and not DOM structure
	        // console.log('Popup script:')
	        // console.log(results);
	    });
	});

	// on project dropdown selection
	$("#project-list").change(function(){
		var value = $(this).val();

		if(value != ""){
			$("*[data-project]").hide();
			$("*[data-project='"+value+"']").show();
		}else{
			$("*[data-project]").show();
		}
		renderSummary();
	});

	// on project dropdown selection
	$("#user-list").change(function(){
		var value = $(this).val();

		if(value != ""){
			$("*[data-user-id]").hide();
			$("*[data-user-id='"+value+"']").show();
		}else{
			$("*[data-user-id]").show();
		}
		renderSummary();
	});

	// on change dates
	$('#daterange').daterangepicker({
	    opens: 'left'
	}, function(start, end, label) {
	    console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));

	    $("*[data-date]").hide();
	    $("*[data-date]").each(function(){
		    var currentDate = new Date($(this).attr('data-date'));
		    var minDate = new Date(start.format('MM/DD/YYYY'));
		    var maxDate =  new Date(end.format('MM/DD/YYYY'));

		    if (currentDate > minDate && currentDate < maxDate ){
		         $(this).show()
		    }
		    else{
		        // alert('Out Side range !!')
		    }
		});
	});
});