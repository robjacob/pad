"use strict";

var PORTNUM = "10099"

// Common shared subroutine, take json dump of a list of bookmarks and display them
function displayPad (jsonObj) {
	// Calculate max distance^2 for shading
	var maxDist = 0
	jsonObj.forEach (function(b) { if (b.dist>maxDist) maxDist = b.dist })
	
	// Remove any previous children under the id=bookmarks node
	var bookmarkshtml = document.getElementById('bookmarks')
	while (bookmarkshtml.hasChildNodes()) {
		bookmarkshtml.removeChild(bookmarkshtml.lastChild);
	}

	// Make a new child for each bookmark
	jsonObj.forEach (function (b) {
		// Clone an html subtree for this bookmark
		var bhtml = document.getElementById('bookmark').cloneNode(true); // true = deep copy

		// Populate the new html subtree.
		// These particular classnames are
		// used just so this code can fish out the <span>'s,
		// not necessarily for CSS styling
		
		bhtml.getElementsByClassName("title")[0].innerHTML = b.title;
		bhtml.getElementsByClassName("time")[0].innerHTML = moment (b.time).fromNow();
		bhtml.getElementsByClassName("url")[0].innerHTML = b.url;
		bhtml.getElementsByClassName("selection")[0].innerHTML = b.selection;
		if (b.thumb != null) bhtml.getElementsByClassName("thumb")[0].src = b.thumb;

		// Shading based on distance squared,
		// want "decrement" from pure white when you hit maxDist
		var decrement = 0.2		
		var brightness = Math.floor (255 * (1 - b.dist * (decrement / maxDist)))
		bhtml.getElementsByClassName("bookmarkBackground")[0].style.backgroundColor =
			"rgb(" + brightness + "," + brightness + "," + brightness + ")"

		// Make the bar graph
		var rect = bhtml.getElementsByClassName("bar")[0]
		rect.y.baseVal.value = 60*(1.-b.interest); // This "60" also appears in front.html
		rect.height.baseVal.value = 60*b.interest;

		bhtml.style.display="inline";

		// Add it under id=bookmarks node
		bookmarkshtml.appendChild(bhtml);
	})
}

// No arg, chases down all our "brain" sliders for input,
// no return data
function brain () {
	var state = ""
	var sliders = document.getElementsByClassName("slider")
	for (var s=0; s<sliders.length; s++) {
		state = state + sliders[s].value + ","
	}

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () { }
	xmlhttp.open ("GET", "http://localhost:" + PORTNUM + "?" + "action=brain&state=" + state, true);
	xmlhttp.send (null);
}

// No arg, no return data
// Calling view() is no use because child process
// probably didn't finish yet, for solution, see ../pad1
function save () {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () { }
	xmlhttp.open ("GET", "http://localhost:" + PORTNUM + "?" + "action=save", true);
	xmlhttp.send (null);
}

// No arg,
// We take returned JSON dump of bookmarks and display them
function view () {
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState==4) {
			var jsonObj = JSON.parse(xmlhttp.responseText);
			if (jsonObj!=null) displayPad (jsonObj);
		}
	}

	xmlhttp.open ("GET", "http://localhost:" + PORTNUM + "?" + "action=view", true);
	xmlhttp.send (null);
}

window.onload = function () {
	brain ()
}
