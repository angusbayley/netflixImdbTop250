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
  i = 1;
  findNextTitle(responseText);
  //console.log("findNextTitle finishes at: " + Date.now());
  purge();
}

function findNextTitle(remainingHTML) { // this is rapid
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
	findNextTitle(remainingHTML);
	showImages();
}

function purge() { // this is slow (4s)
	//console.log("purge starts at: " + Date.now());
	var movies = document.getElementsByClassName('agMovie');
	var length = movies.length;
	var j = 0;
	for (k=0; k<length; k++) {
		//console.log("purge iteration starts at: " + Date.now());
		var thisMovie = movies[j].getElementsByTagName("img")[0].alt;
		if (!inTop250(thisMovie)) {
			//console.log("it's not! Removing " + thisMovie)
			movies[j].parentNode.removeChild(movies[j]);	// 	*** this is the slow line ***
			//console.log("not in top 250 block ends at: " + Date.now());
		}
		else {
			//console.log(thisMovie + " is in the top 250. Keeping it.");
			j++;
		}
	}
	//console.log("purge for loop finishes at: " + Date.now());
	removeEmptyRows();
	//console.log("removeEmptyRows finishes at: " + Date.now());
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
