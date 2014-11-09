console.log("contentScript reporting for duty");

var path = "http://www.imdb.com/chart/top";

function getIMDB() { // this is quick enough (probs can't do anything about it anyway)
	console.log("request starts at: " + Date.now());
	var req = new XMLHttpRequest();
	req.open('GET', path, true);
	req.onload = parseAndPurge;
	req.send(null);
}

function parseAndPurge(e) {
	console.log("onload at: " + Date.now());
	var responseText = e.target.responseText;
  closeSpan = "</span>";
  rightArrow = ">";
  closeA = "</a>";
  top250 = [];
  titleColumnText = 'class="titleColumn"';
  var i = 1;
  findNextTitle(responseText, i);
  //console.log("findNextTitle finishes at: " + Date.now());
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

function purge() {
	//console.log("purge starts at: " + Date.now());
	var rows = document.getElementsByClassName("mrow");
	rowScheduler(rows);
	console.log("purge finishes at: " + Date.now());
}

function rowScheduler(rows) {

	// Prioritisation should happen by deleting all rows in view then deleting the one above then the one
	// below then above then below etc. If the next above/below is the last before the start/end of the
	// page then the prioritiser should deal with that row then only go in the opposite direction
	// thereafter. The prioritiser should output an array of indeces that correspond to rows, then a
	// function for filtering out a single row should iteratively take each element of the array, use it
	// to locate the row, and filter that row.

	var countRows = rows.length;

	var firstRowTopDiff = rows[0].getBoundingClientRect().top;
	if(firstRowTopDiff>0) {
		var j = 0;
		for (var i=0; i<countRows; i++) {
			filterRow(rows[j]);
			showImages(rows[j]);
			if (!removeRowIfEmpty(rows[j])) { j++ }		// evaluates false if row removed
		}
	}
	else {
		for (var i=1; i<countRows; i++) {
			var topDiff = rows[i].getBoundingClientRect().top;
			if (topDiff>0) {														// i now represents the first fully visible row
				break;
			}
		}
		processRow(rows, i-1);										// first row gets processed
		processRow(rows, i);
		if (rows[i+1]) {processRow(rows, i+1);}
		if (rows[i+2]) {processRow(rows, i+2);}		// all rows in view at normal zoom are now processed

//now, process the next row down then next row up, then down then up until all rows done:
		
		window.setTimeout(function() {cleanSurroundingRows(i, 2, rows)}, 1000);
	}
}

function cleanSurroundingRows(i, j, rows) {
	console.log("cleaning... j = " + j);
	if (rows[i+j]) {									// checks row exists first
		processRow(rows, (i+j));	
	}
	if (rows[i-j]) {									// checks row exists first
		console.log("i: "+i);
		rowsAboveRemoved = 0;
		processRow(rows, (i-j), true);
		i -= rowsAboveRemoved;
		//console.log("shifted i: "+i);
	}
	console.log("function's i, j: " + i + ", " + j);
	if (j>rows.length) {
		return ;
	}

	window.setTimeout(function() {
		console.log("callback's i, j: " + i + ", " + j);
		cleanSurroundingRows(i,j+1,rows);
	}, 100);
}


function processRow(rows, index, above) {	// reason for taking these arguments: see below
	filterRow(rows[index]);
	showImages(rows[index]);
	if (removeRowIfEmpty(rows[index])) {							// evaluates true if row was removed

		if (above) {
			rowsAboveRemoved++;
			index --;
			//console.log("rowsAboveRemoved is working");
			if (rows[index]) {															// rows is a node list so rows[index] has a different meaning now
				processRow(rows, index, true);	// processes the row that replaced the old one
			}
		}

		else if (rows[index]) {															// rows is a node list so rows[index] has a different meaning now
			processRow(rows, index, false);	// processes the row that replaced the old one
		}
	}
} 

function filterRow(row) {
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

if (document.readyState != "loading") {
	getIMDB();
}
else {
	console.log(Date.now());
	document.addEventListener('DOMContentLoaded', getIMDB);
}
