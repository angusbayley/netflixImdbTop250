console.log("contentScript reporting for duty");

var path = "http://www.imdb.com/chart/top";

function getIMDB() { // this is quick enough (probs can't do anything about it anyway)
	console.log("request starts at: " + Date.now());
	var req = new XMLHttpRequest();
	req.open('GET', path, true);
	req.onload = displayResponse;
	req.send(null);
}

function displayResponse(e) {
	console.log("displayResponse starts at: " + Date.now());
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
	//showImages();
}

function purge() {
	//console.log("purge starts at: " + Date.now());
	var rows = document.getElementsByClassName("mrow");
	var rowSchedule = rowScheduler(rows);
	for (var i=0; i<rowSchedule.length; i++) {
		var row = rows[rowSchedule[i]];
		//filterRow(row);
	}
	//removeEmptyRows();
}

function rowScheduler(rows) {

	// Prioritisation should happen by deleting all rows in view then deleting the one above then the one
	// below then above then below etc. If the next above/below is the last before the start/end of the
	// page then the prioritiser should deal with that row then only go in the opposite direction
	// thereafter. The prioritiser should output an array of indeces that correspond to rows, then a
	// function for filtering out a single row should iteratively take each element of the array, use it
	// to locate the row, and filter that row.

	var countRows = rows.length;
	for (var i=0; i<countRows; i++) {
		console.log(Date.now());
		console.log("client top clearance: " + rows[i].getBoundingClientRect().top);
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

function removeEmptyRows() {	// this is rapid
	var rows = document.getElementsByClassName("mrow");
	var length = rows.length;
	var j = 0;
	for(k=0; k<length; k++) {
		if(rows[j].getElementsByTagName('img').length == 0) {
			rows[j].parentNode.removeChild(rows[j]);
		}
		else if(rows[j].children.length==3) { //deals with rows that are empty && "based on your interest in... <img>":
			if(rows[j].getElementsByClassName("evidence hasvids").length != 0) {
				rows[j].parentNode.removeChild(rows[j]);
			}
			else {
				//console.log(rows[j].getElementsByTagName('a')[0].innerHTML);
				j++;
			}
		}
		else {
			//console.log(rows[j].getElementsByTagName('a')[0].innerHTML);
			j++;
		}
	}
}

function showImages() {
	var images = document.getElementsByTagName('img');
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
