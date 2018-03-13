"use strict";

const PORTNUM = "10099"

// The browser window where you do your real browsing
var otherWindow

/*
 * Start up
 * must put this here not in onload()
 * because javascript only lets you call window.open() from a user action
 */
function startCB (button) {
	updateBrain()

	// Open up our second window, the one for actual browsing
	// Would like to set it to "left=460, top=30, width=600, height=680
	// but doing so seems to prevent my other options, mainly location
	otherWindow = window.open ("http://www.tufts.edu", "",
				   "resizable=yes, scrollbars=yes, status=yes, toolbar=no, location=yes, personalbar=yes, titlebar=yes")

	// You'll never need this button again
	document.getElementsByClassName("startButtonArea")[0].style.display="none"
}

/*
 * Button callback
 * Save current page in allBookmarks
 */
function saveCB () {
	updateBrain ()

	var url = otherWindow.location.href
	var title = otherWindow.document.getElementsByTagName("title")[0].innerHTML

	// Save the bookmark (using current state)
	allBookmarks.push (new Bookmark (url, title))

	// Redisplay the bookmark list (optional)
	viewCB ();
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

	// sort by distance
	allBookmarks.sort(function (a,b) {return a.dist - b.dist})

	displayPad (allBookmarks)
}

/*
 * Callback if you click on a bookmark in the bookmarks list.
 * arg = the "bookmarkBackground" HTML div
 */
function bookmarkCB (div) {
	otherWindow.location.href = div.getElementsByClassName("url")[0].innerHTML
}

// Common subroutine, take json dump of a list of bookmarks and display them
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
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState==4) {
			var response = xmlhttp.responseText
			var tokens = response.trim().split (",")

			if (response == "") {
				// Will happen if we're using sliders instead
				currentState = new StatePoint (Array.from (document.getElementsByClassName("slider"))
					.map (function (s) { return s.value/100.0 }))
			}
			else if (tokens.length < 1) {
				console.error ("updateBrain: can't parse input : " + response);
			}
			else {
				currentState = new StatePoint (
					tokens.map (function (t) { return parseFloat (t) }))
			}

			// Placeholder, intend to be getting this from physio or other sensor
			currentInterest = Math.random()
		}
	}
	xmlhttp.open ("GET", "http://localhost:" + PORTNUM + "?brain", true);
	xmlhttp.send (null);
}
