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

Display *all* the items, ordered by distance,
and shaded based on their distance.

Alternately, could truncate the list something like:

* Must be within RADIUSFAR otherwise forget it.

* And, even if there are many, want ALL entries that are
very close (ie within RADIUSNEAR), so I don't lose something I
thought I filed

Avoid biofeedback effect, where the 2 peripheral windows
keep swapping as brain state changes. Maybe it's very subtle.
(*)Or it only shows up when you try to bookmark something.

Brain state never causes us to mess with the main window.

### Save:

Press Save button = saves with
the current brain state and (placeholder) current interest level.

And the auxiliary display reorders itself

Nearest neighbor approach:
Save each bookmark along with its raw data, no classifier

## UI Implementation

Main window = vanilla Safari

Bookmark window =

* "Save" button

* "View" button

* Bookmarks display

* Sliders window = like other prototypes, not intended to be in final system

    * Also shows brain state back to the user

Bookmarks display

* Shows list of bookmarks, ordered and shaded.

* If you click a bookmark it sends main browser there

* If you select a text region, we save that (along
with URL of the page it was on), otherwise we just save the
URL.

View

* Displays all (or nearby) bookmarks whenever you hit View

* Continuously update as brain state changes (could provide UI control to toggle this on and off)

## Usage

Close all your existing browser windows

Run startup.sh on command line

or just manually do:

* node back.js

* Open a Safari window on ./front.html

* Open another Safari window for regular browsing

Compatibility and porting

* This system is currently implemented for Mac, using Safari.

    * Also must 'Allow JavaScript from Apple Events' option in
Safari's Develop menu

* Should work with different browsers on Mac: 

    * Change the shell scripts getbookmark.sh and sendbookmark.sh

* Should work on windows:

    * Replace the shell scripts getbookmark.sh and sendbookmark.sh
with powerscript or other code that will
perform the same tasks

## Code Files

### front.html

What you should open in your browser, calls front.js and styles.css.

### front.js

Main program, provides the widget callbacks for front.html

* Calls pad.js for help

* Calls back.js via xmlhttp for help

### pad.js

Part of frontend that
holds and manipulates the data base of bookmarks.

### back.js

Runs as the backend (using node.js), listens for calls from front.js.

Does things we need that you can't do in a browser easily, i.e.:

* Get bookmark data from browser

* Send URL to browser

* Read on a port from the brain server code.

Mainly deals with http related overhead.
Also applescript calls probably all have to be made from this side.
Also contains code for communicating with brain program that gets brain data (that may be out of date with respect to current code in the lab).
Is generally passive, waits for calls.

### getbookmark.sh

Shell script to collects data needed for making a bookmark from browser and OS.
The code is specific to Mac OS and Safari, but could provide substitute code for a different OS here, also see notes on compatibility above.

### sendbookmark.sh

Shell script to send a URL (given as single command line arg) to our browser window.
The code is specific to Mac OS and Safari, but could provide substitute code for a different OS here, also see notes on compatibility above.

### startup.sh

Simple shell script to start up the programs, not really necessary, see above

### URL Syntax:

Our URL syntax for xmlhttp calls: http://localhost:10099/?QUERY

where QUERY = getbookmark, brain, or sendbookmark&URLYOUWANT
(in future could use proper syntax like ?foo=bar&fie=baz; also may need
to escape URLYOUWANT)

