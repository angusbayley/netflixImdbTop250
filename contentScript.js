console.log("hello world");

console.log("and again!");
var movies = document.getElementsByClassName('agMovie');
console.log(movies);

var length = movies.length;
var j = 0;
for (i=0; i<length; i++) {
	console.log(i);
	var thisMovie = movies[j].getElementsByTagName("img")[0].alt;
	if (!inTop250(thisMovie)) {
		console.log("it's not! Removing " + thisMovie)
		movies[j].parentNode.removeChild(movies[j]);
	}
	else {
		j++;
	}
}

function inTop250(movieToCheck) {
	console.log("checking whether " + movieToCheck + " is in top 250")
	return(movieToCheck == "Manhattan");
}