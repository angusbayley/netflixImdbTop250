var IMDbTop250Path = "http://www.imdb.com/chart/top";
var RTTop100Path = "http://www.rottentomatoes.com/top/bestofrt";

function getIMDB() { // this is quick enough (probs can't do anything about it anyway)
	console.log("request starts at: " + Date.now());
	var req = new XMLHttpRequest();
	req.open('GET', IMDbTop250Path, true);
	req.onload = parseAndPurge;
	req.send(null);
}

function parseAndPurge(e) {
	console.log("onload at: " + Date.now());
	var exceptions = ["The Killing"];
	var responseText = e.target.responseText;
  closeSpan = "</span>";
  rightArrow = ">";
  closeA = "</a>";
  top250 = [];
  titleColumnText = 'class="titleColumn"';
  var i = 1;
  findNextTitle(responseText, i);
  top250 = cleanseTop250(top250, exceptions);
  console.log("findNextTitle finishes at: " + Date.now());
  purge();
}

function findNextTitle(remainingHTML, i) { // this is rapid
		// Get to end of start of next .titleColumn <td>
	remainingHTML = remainingHTML.slice(remainingHTML.indexOf(titleColumnText) + titleColumnText.length);
		// Get to end of next </span>
	remainingHTML = remainingHTML.slice(remainingHTML.indexOf(closeSpan) + closeSpan.length);
		// Get next title
	var title = remainingHTML.substring(remainingHTML.indexOf(rightArrow) + rightArrow.length, remainingHTML.indexOf(closeA));
		// Push to array
	top250.push(title);
		// ...aaaand recur
	i++;
	if (i>250) { return }
	findNextTitle(remainingHTML, i);
}

function cleanseTop250(top250, exceptions) {
	for (var i=0; i<exceptions.length; i++) {
		top250.splice(top250.indexOf(exceptions[i]), 1);
	}
	return top250;
}

function purge() {
	//console.log("purge starts at: " + Date.now());
	var rows = document.getElementsByClassName("mrow");
	rowScheduler(rows);
	console.log("purge finishes at: " + Date.now());
}

// Prioritisation should happen by deleting all rows in view then sequentially deleting the ones
// below one by one until the end. removeRowIfEmpty() is built into this, and if the row is removed
// the same row should be processed next (because the rows are in a nodelist, not an array).


function rowScheduler(rows) {
	window.scrollTo(0,0);										// scrolls to top of page
	var countRows = rows.length;
	console.log(countRows);
	var firstRowTopDiff = rows[0].getBoundingClientRect().top;
	if(firstRowTopDiff>0) {									// always true if scrolling to top works
		var i = 0;
		processRow(rows, i); i ++;						// first row gets processed
		processRow(rows, i); i ++;						// all rows in view at normal zoom are now processed
		console.log("Visible rows deleted at " + Date.now())
		processRemainingRows(rows, i);				// all remaining rows are asynchronously removed one by one
	}		
}

function processRow(rows, index) {				// reason for taking these arguments: see below
	if (rows[index]) {											// only preceed if the row exists
		filter(rows[index]);
		showImages(rows[index]);
		if (removeRowIfEmpty(rows[index])) {	// evaluates true if row was removed
			if (rows[index]) {									// rows is a node list so rows[index] has a different meaning now
				processRow(rows, index);					// processes the row that replaced the old one
			}
		}
	}
} 

function processRemainingRows(rows, index) {
	processRow(rows, index); index++;
	console.log("callback i = " + index );
	if (index>rows.length) {
		chrome.extension.sendMessage("done");
		console.log("contentScript says 'done'");
		return
	}
	window.setTimeout(function() {
		processRemainingRows(rows, index);
	}, 300);
}

function filter(row) {
	var movies = row.getElementsByClassName('agMovie');
	var length = movies.length;
	var j = 0;
	for (k=0; k<length; k++) {
		//console.log("purge iteration starts at: " + Date.now());
		var thisMovie = movies[j].getElementsByTagName("img")[0].alt;
		if (!inTop250(thisMovie)) {
			movies[j].parentNode.removeChild(movies[j]);	// 	*** this is the slow line ***
			//console.log("not in top 250 block ends at: " + Date.now());
		}
		else {
			j++;
		}
	}
}

function inTop250(movieToCheck) { // slow but not the slowest part (accounts for ~1/4 of the time)
	// look to replace this with a built in function such as array.contains or similar - may increase speed
	//console.log("inTop250 starts at: " + Date.now());
	for (var m=0; m<top250.length; m++) {
		if (movieToCheck == top250[m]) {
			//console.log("inTop250 ends at: " + Date.now());
			return true
		}
	}
	//console.log("inTop250 ends at: " + Date.now());
	return false;
}

function removeRowIfEmpty(row) {	// this is rapid
	if(row.getElementsByTagName('img').length == 0) {
		row.parentNode.removeChild(row);
		return true;
	}
	else if(row.children.length==3) { //deals with rows that are empty && "based on your interest in... <img>":
		if(row.getElementsByClassName("evidence hasvids").length != 0) {
			row.parentNode.removeChild(row);
			return true;
		}
	}
}

function showImages(row) {
	var images = row.getElementsByTagName('img');
	for (j=0; j<images.length; j++) {
		var src = images[j].getAttribute('hsrc');
		if(src) {
			images[j].removeAttribute('hsrc');
			images[j].setAttribute('src', src);
		}
	}
}

function addButtons() {
    $("#global-header").append( '<li id="IMDb-top-250" class="nav-item"><a>IMDb top 250</a></li><li id="RT-top-100" class="nav-item">RT top 100</li>' ); 
}

console.log("new script 2");
$(document).ready(function() {
	addButtons();
	$('#IMDb-top-250').click(getIMDB);
	$('#RT-top-100').click(getIMDB);
});

