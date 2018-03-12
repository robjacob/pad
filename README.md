# Multi-state Scratchpad Prototype

## Conceptual Design

You have a list of bookmarks

* Each is associated with a raw brain state or other reading,
no classifiers, just index by set of features.

* They are always displayed, in an auxiliary window, but they are ordered
by how close they are to your current state.

* You can bookmark additional pages and have them associated
with your current state.

### Brain:

The selection by brain state applies to both input and output:

* Save: when you bookmark something, brain state determines
where in the ordered list it goes.

* View: When you request information, brain determines
ordering of the bookmarks, ie the ones associated
with similar (nearest neighbor) states to your current
state.

Maybe we use context and other information as well as
brain state to choose among several bookmarks or group or
configurations, thinking again back to
activity-based window managers as an analogy

Some state info could be physiological and some could be brain

The bookmarks are also marked with an (orthogonal)
dimension of interest or arousal, currently not implemented.

### Further:
Have some explicit index terms for the bookmarks, eg 5:

* Select content, Hit Save,

* Think of one of 5 predefined distinctive thoughts
(like Donchin wheelchair commands) to pick which set to display
or display first.

* May be more useful with Glass, where input is more limited.

### View:

Press View button = displays the bookmarks ordered by distance
to current brain state. 

Avoid biofeedback effect, where the 2 peripheral windows
keep swapping as brain state changes. Maybe it's very subtle.
(*)Or it only shows up when you try to bookmark something.

Brain state never causes us to mess with the main window.

### Save:

Press Save button = saves with
the current brain state and (unimplemented) current interest level.

And the auxiliary display reorders itself

### Nearest neighbor approach:

Save each bookmark along with its raw data, no classifier

### Retrieve:

Display *all* the items, ordered by distance,
and shaded based on their distance.

Alternately, could truncate the list something like:

* Must be within RADIUSFAR otherwise forget it.

* And, even if there are many, want ALL entries that are
very close (ie within RADIUSNEAR), so I don't lose something I
thought I filed

## UI Implementation

Main window = vanilla Safari

Bookmark window =

* "Save" button

* "View" button

* Bookmarks display

Sliders window = like other prototypes, not intended to be in final system

Bookmarks display

* Shows list of bookmarks, ordered and shaded.

* If you click a bookmark it sends main browser there

* If you select a region, we save that (along
with URL of the page it was on), otherwise we just save the
URL.

View

* Displays all (or nearby) bookmarks whenever you hit View

* Continuously update as brain state changes?

## Usage

Usage:  Run startup.sh on command line

or just manually do:

* node back.js

* Open a Safari window on ./front.html

* Open another Safari window for regular browsing

Compatibility and porting

* This system is currently implemented for Mac, using Safari.

    * Also must 'Allow JavaScript from Apple Events' option in
Safari's Develop menu

* Should work with different browsers on Mac: 

    * change the applescript fragments in pad.js

* Should work on windows:

    * if you replace the applescript
fragments in pad.js with powerscript or other code that will
perform the same tasks

## Code Files

### front.html

What you should open in your browser, calls front.js and styles.css.
Handles the callbacks from the HTML page -- by communicating
with back.js.

### back.js

Runs backend server, listens for calls from front.js,
and sends some of them to pad.js to do the work. Mainly deals with http.
Also contains code for communicating with brain program that gets brain data (that may be out of date with respect to current code in the lab).

### pad.js

Main code, maintains bookmark lists, etc.
Runs as the backend (using node.js) part of the system holds the data base of bookmarks.
Is generally passive, waits for calls.
Also applescript calls probably all have to be made from this side.

### getbookmark.sh

Script to collects data needed for making a bookmark from browser and OS.
The code is specific to MacOs and Safari, but could provide substitute code for a different OS here, also see notes on compatibility above.

### startup.sh

Simple shell script to start up the programs, not really necessary, see above

### URL Syntax:

Our URL syntax: http://localhost:10099/?action=ACTION&state=123&pad=123

where ACTION = brain, view, save

See inline documentation in pad.js for details of each of the actions
