console.log("contentScript reporting for duty");

var path = "http://www.imdb.com/chart/top";

function getIMDB() {
	var req = new XMLHttpRequest();
	req.open('GET', path, true);
	req.onload = displayResponse;
	req.send(null);
}

function displayResponse(e) {
	var responseText = e.target.responseText;
  closeSpan = "</span>";
  rightArrow = ">";
  closeA = "</a>";
  top250 = [];
  titleColumnText = 'class="titleColumn"';
  i = 1;
  findNextTitle(responseText);
  console.log("top 250 after recursion: " + top250);
  purge();
}

function findNextTitle(remainingHTML) {
		// Get to end of start of next .titleColumn <td>
	remainingHTML = remainingHTML.slice(remainingHTML.indexOf(titleColumnText) + titleColumnText.length);
		// Get to end of next </span>
	remainingHTML = remainingHTML.slice(remainingHTML.indexOf(closeSpan) + closeSpan.length);
		// Get next title
	var title = remainingHTML.substring(remainingHTML.indexOf(rightArrow) + rightArrow.length, remainingHTML.indexOf(closeA));
		// Push to array
	top250.push(title);
	console.log(i + ": " + title);
		// ...aaaand recur
	i++;
	if (i>250) { return }
	findNextTitle(remainingHTML);
}

function purge() {
	var movies = document.getElementsByClassName('agMovie');
	console.log(movies);

	var length = movies.length;
	var j = 0;
	for (k=0; k<length; k++) {
		var thisMovie = movies[j].getElementsByTagName("img")[0].alt;
		if (!inTop250(thisMovie)) {
			console.log("it's not! Removing " + thisMovie)
			movies[j].parentNode.removeChild(movies[j]);
		}
		else {
			console.log(thisMovie + " is in the top 250. Keeping it.");
			j++;
		}
	}
}

function inTop250(movieToCheck) {
	console.log("checking whether " + movieToCheck + " is in top 250");
	// look to replace this with a built in function such as array.contains or similar - may increase speed
	for (var m=0; m<top250.length; m++) {
		if (movieToCheck == top250[m]) {
			return true
		}
	}
	return false;
}


if (document.readyState == "complete") {
	getIMDB();
}
else {
	document.addEventListener('DOMContentLoaded', getIMDB);
}
