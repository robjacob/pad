// To run: see ./startup.sh -

/*
 * The node.js (backend) part of the system holds the data base of bookmarks.
 *
 * NB Currently we only send our own fixed constants or else numbers via URL,
 * if send other data, might want to call escape(THEDATA)
 */

// Node.js requires this if you use new class syntax
"use strict";

var child_process = require ('child_process')

/*
 * Object to hold a single brain/body state reading
 * (a point in the feature space), holds raw features, no classifier.
 * Sort of assume each feature is 0..1
 */
class StatePoint {
    // Arg is an array of numbers
    constructor (args) {
	this.data = args.slice(0) // To get kind of a deep copy
    }

    // Square of Euclidean distance to point p
    dist (p) {
	var ans = 0
	this.data.forEach (function (value, index) {
	    ans += (p.data[index] - value) * (p.data[index] - value)
	})
	return ans
    }	
}

// Latest measurements, i.e., what we would act upon
var currentState = new StatePoint ([0, 0, 0, 0, 0])
var currentInterest = 0.5

class Bookmark {
    constructor (url, title, thumb, selection) {
	this.url = url;
	this.title = title;

	// Specific selection if applicable (vice just save URL)
	// text or null
	this.selection = selection

	// Filename (temporary file) of thumbnail
	// or placeholder dummy file
	if (thumb) this.thumb = thumb
	else this.thumb = "dummy.png"

	// Brain/body state measurement to be associated with this bookmark
	this.statePoint = currentState;

	// An optional feature, you can ignore it.
	// Holds 1 scalar of other brain or body state info,
	// for gradient bookmark retrieval
	this.interest = currentInterest;

	// We set this one ourselves
	this.time = new Date();

	// Distance to currentState at the moment
	// Is temp variable, will keep changing as currentState changes
	this.dist = 0
    }

    // Update because currentState may have changed
    updateDist () {
	this.dist = this.statePoint.dist(currentState)
    }
}

var allBookmarks = []

// Call from our server
function doRequest (params) {
	// Command = "brain"
	// Store current brain (or other) state reading
	// Arg = 5 comma-separated raw numbers 0..100 for now
	if (params["action"]=="brain") {
		// Convert it from slider 0..100 to 0..1
		// and save it in our variable
		var coords = params["state"].split(',');

		currentState = new StatePoint ([
		    parseInt (coords[0])/100.0,
		    parseInt (coords[1])/100.0,
		    parseInt (coords[2])/100.0,
		    parseInt (coords[3])/100.0,
		    parseInt (coords[4])/100.0
		])

		// Placeholder, intend to be getting this from physio or other sensor
		currentInterest = Math.random()

    		// Nothing to return, but apparently server requires a string
		return "";
	}

	// "view"
	// Show bookmarks for user to view
	// No args
	// Return json struct of all bookmarks, sorted by distance to current state
	else if (params["action"]=="view") {
		// First update the distances
		allBookmarks.forEach (function (b) { b.updateDist() })

		// sort by distance
		allBookmarks.sort(function (a,b) {return a.dist - b.dist})

		return JSON.stringify (allBookmarks)
	}

	// "save"
	// Save current page in allBookmarks, no change display
	// No args
	// Return nothing
	else if (params["action"]=="save") {
		// We get all the data for a bookmark in one shot,
		// and install the bookmark in the callback
		// to avoid further asynchronous callback ugliness
		child_process.exec ("sh getbookmark.sh", function(error, stdout, stderr) { 
			if (error!=null) console.error ("getbookmark.sh returned error: " + error);
			if (stderr!="") console.error ("getbookmark.sh returned stderror: " + stderr);

			// Parse the returned data
			var url = stdout.split("\n")[0]
			var title = stdout.split("\n")[1]
			var tempfilename = stdout.split("\n")[2]
			var selection = stdout.split("\n").slice(3).reduce (function (a,b) { return a + "\n" + b; }, "")
			if (selection.trim() == "") selection = null;

			// Save the bookmark (using current state)
			allBookmarks.push (new Bookmark (url, title, tempfilename, selection))
		})

    		// This will return without waiting for above child process
		return "";
	}

	else {
		console.error ("Error in ACTION passed to pad.js doRequest: " + params["action"])
		return "";
	}
}

/*
 * Call from brainclient, arg = line of text from matlab
 * This is coming from a separate thread,
 * both threads access currentState and currentInterest
 * we set them, others just read them (except the GUI slider)
 * and it's a single atomic setting of a variable,
 * so synchronization issues should be ok
 */
function doBrain (line) {
	var tokens = line.trim().split (",")
	if (tokens.length < 5) {
		console.error ("doBrain: can't parse input line: " + line);
	}
	else {
		currentState = new StatePoint ([
		    parseFloat (tokens[0]),
		    parseFloat (tokens[1]),
		    parseFloat (tokens[2]),
		    parseFloat (tokens[3]),
		    parseFloat (tokens[4])
		])
	}
}

// Some miscellaneous initialization to start us up
allBookmarks.push (new Bookmark ("http://www.tufts.edu/\n", "Tufts University\n", null, null))
currentState = new StatePoint ([.4, 0, 0, 0, 0])
allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/\n", "Rob Jacob Home Page\n", null, null))
currentState = new StatePoint ([.8, 0, 0, 0, 0])
allBookmarks.push (new Bookmark ("http://www.tufts.edu/home/visiting_directions/\n", "Visiting, Maps & Directions - Tufts University\n", null, null))
currentState = new StatePoint ([0, 0, 0, 0, 0])

exports.doRequest = doRequest;
exports.doBrain = doBrain;

/*
 * Various testing
 */

if (require.main === module) {
	var b = new Bookmark ("http://www.tufts.edu/home/visiting_directions/\n", "Visiting, Maps & Directions - Tufts University\n", null, null);
	console.log (b)
	console.log (JSON.stringify(b))

	console.log (" ")
	var b3 = JSON.parse (JSON.stringify(b))
	console.log (b3)
	console.log (JSON.stringify(b) == JSON.stringify(b3))

	console.log (" ")
	console.log (currentState)

	doRequest ({action: "brain", state: "11,22,33,44,55" })
	console.log (currentState, currentInterest)
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))

	doRequest ({action: "brain", state: "40,22,33,44,55" })
	console.log (currentState, currentInterest)
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))

	doRequest ({action: "brain", state: "60,22,33,44,55" })
	console.log (currentState, currentInterest)
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))

	doRequest ({action: "brain", state: "80,22,33,44,55" })
	console.log (currentState, currentInterest)
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))
	allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/papers\n", "Rob Jacob Papers\n", null, null))

	doRequest ({action: "brain", state: "40,22,33,44,55" })
	console.log (currentState, currentInterest)
	doRequest ({action: "view" })

	doRequest ({action: "brain", state: "11,22,33,44,55" })
	console.log (currentState, currentInterest)
	doRequest ({action: "view" })

	doRequest ({action: "brain", state: "40,22,33,44,55" })
    	doRequest ({action: "save" })
    	doRequest ({action: "save" })
    	doRequest ({action: "save" })
    	doRequest ({action: "save" })
    	doRequest ({action: "view" })

	var b = chooseBookmarks()
	console.log (b.length, allBookmarks.length)
	console.log (JSON.stringify(b))
	// console.log (allBookmarks)
}
