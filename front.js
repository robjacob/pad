/*
 * Main program, provides the widget callbacks for front.html
 * Calls pad.js for help
 * Calls back.js via xmlhttp for help
 */

"use strict";

const PORTNUM = "10099"

/*
 * Button callback
 * Save current page in allBookmarks
 *
 * Calling view() at the end is no use because child process
 * probably didn't finish yet, for solution, see ../pad1
 */
function saveCB () {
	updateBrain ()

	doXML ("getbookmark", function (responseText) {
		// Parse the returned data
		var url = responseText.split("\n")[0]
		var title = responseText.split("\n")[1]
		var tempfilename = responseText.split("\n")[2]
		var selection = responseText.split("\n").slice(3).reduce (function (a,b) { return a + "\n" + b; }, "")
		if (selection.trim() == "") selection = null;

		// Save a bookmark (using current state)
		allBookmarks.push (new Bookmark (url, title, tempfilename, selection))
	})
}

/*
 * Button callback
 * Show bookmarks for user to view
 * Displays all bookmarks, sorted by distance to current state
 */
function viewCB () {
	updateBrain ()

	// First update the distances (must updateBrain() first)
	allBookmarks.forEach (function (b) { b.updateDist() })

	// Sort by distance
	allBookmarks.sort(function (a,b) {return a.dist - b.dist})

	// Calculate max distance^2 for shading
	var maxDist = 0
	allBookmarks.forEach (function(b) { if (b.dist>maxDist) maxDist = b.dist })
	
	// Remove any previous children under the id=bookmarks node
	var bookmarkshtml = document.getElementById('bookmarks')
	while (bookmarkshtml.hasChildNodes()) {
		bookmarkshtml.removeChild(bookmarkshtml.lastChild);
	}

	// Make a new child for each bookmark
	allBookmarks.forEach (function (b) {
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

		// Make it not invisible
		bhtml.style.display="inline";

		// Add it under id=bookmarks node
		bookmarkshtml.appendChild(bhtml);
	})
}

/*
 * Callback if you click on a bookmark in the bookmarks list.
 * arg = the "bookmarkBackground" HTML div
 */
function bookmarkCB (div) {
	doXML ("sendbookmark&" + div.getElementsByClassName("url")[0].innerHTML, null)
}

/* 
 * Read brain client and update our currentState,
 * using back.js to do the actual reading,
 * we parse the text data from brain client here.
 *
 * Or else will chase down all our GUI "brain" sliders for our input
 * and convert them from slider 0..100 to 0..1
 * and update our currentState from that
 */
function updateBrain () {
	doXML ("brain", function (response) {
		var tokens = response.trim().split (",")

		if (response == "") {
			// This will happen if we're using sliders instead
			currentState = new StatePoint (Array.from (document.getElementsByClassName("slider"))
				.map (function (s) { return s.value/100.0 }))
		}
		else if (tokens.length < 1) {
			console.error ("updateBrain: can't parse input : " + response);
		}
		else {
			currentState = new StatePoint (
				tokens.map (function (t) { return parseFloat (t) }))

			// Optional: display it back to user via the sliders
			Array.from (document.getElementsByClassName("slider")).
				forEach (function (s, index) { s.value = 100 * currentState.data[index] })
		}

		// Placeholder, intend to be getting this from physio or other sensor
		currentInterest = Math.random()
	})
}

/*
 * Shared common subroutine, sends an xmlhttp request,
 * calls your callback with the xmlhttp response text as its arg.
 *
 * We can't return anything useful because our xmlhttp call is
 * happening later, asynchronously.
 */
function doXML (request, callback) {
	var xmlhttp = new XMLHttpRequest();

	if (callback==null) xmlhttp.onreadystatechange = function () { };
	else xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState==4) {
			callback (xmlhttp.responseText)
		}
	}

	xmlhttp.open ("GET", "http://localhost:" + PORTNUM + "?" + request, true);
	xmlhttp.send (null);
}

window.onload = function () {
	updateBrain()
}

