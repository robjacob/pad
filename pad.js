/*
 * Holds and manipulates the brain state and the data base of bookmarks
 */

"use strict";

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
	// We assume you have called updateBrain() recently before this
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
    // We assume you have called updateBrain() recently before this
    updateDist () {
	this.dist = this.statePoint.dist(currentState)
    }
}

// Latest measurement, i.e., what we would act upon
var currentState = new StatePoint ([0, 0, 0, 0, 0])

// Ditto, but just a placeholder for now
var currentInterest = 0.5

// The main list
var allBookmarks = []

// Some miscellaneous initialization to start us up
allBookmarks.push (new Bookmark ("http://www.tufts.edu/", "Tufts University", null, null))
currentState = new StatePoint ([.4, 0, 0, 0, 0])
allBookmarks.push (new Bookmark ("http://www.cs.tufts.edu/~jacob/", "Rob Jacob Home Page", null, null))
currentState = new StatePoint ([.8, 0, 0, 0, 0])
allBookmarks.push (new Bookmark ("http://www.tufts.edu/home/visiting_directions/", "Visiting, Maps & Directions - Tufts University", null, null))
currentState = new StatePoint ([0, 0, 0, 0, 0])
