var path = "http://www.imdb.com/chart/top";

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("container").insertAdjacentHTML('beforeend', "about to load");
	var req = new XMLHttpRequest();
	req.open('GET', path, true);
	req.onload = displayResponse;
	req.send(null);
})

function displayResponse(e) {
	var responseText = e.target.responseText;
  closeSpan = "</span>";
  rightArrow = ">";
  closeA = "</a>";
  top250 = [];
  titleColumnText = 'class="titleColumn"';
  i = 1;
  findNextTitle(responseText);
  // document.getElementById("container").insertAdjacentHTML('beforeend', "variable will go here");
}

function findNextTitle(remainingHTML) {
		// Get to end of start of next .titleColumn <td>
	remainingHTML = remainingHTML.slice(remainingHTML.indexOf(titleColumnText) + titleColumnText.length);
		// Get to end of next </span>
	remainingHTML = remainingHTML.slice(remainingHTML.indexOf(closeSpan) + closeSpan.length);
		// Get next title
	var title = remainingHTML.substring(remainingHTML.indexOf(rightArrow) + rightArrow.length, remainingHTML.indexOf(closeA));
		// Push to array
	console.log(i + ": " + title);
	top250.push(title);
		// ...aaaand recur
	i++;
	if (i>250) { return }
	findNextTitle(remainingHTML);
}