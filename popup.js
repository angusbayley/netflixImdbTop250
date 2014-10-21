var path = "http://www.imdb.com/chart/top";

document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("container").insertAdjacentHTML('beforeend', "about to load");
	var req = new XMLHttpRequest();
	req.open('GET', path, true);
	req.onload = displayResponse();
	req.send(null);
})

function displayResponse(e) {
	document.getElementById("container").insertAdjacentHTML('beforeend', " loaded!");			
  document.getElementById("container").insertAdjacentHTML('beforeend', e.target.responseXML);
}
