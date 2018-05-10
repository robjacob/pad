# Multi-state Scratchpad Prototype

## Versions

This is a browser-based javascript implementation.
See "padpy" for a new, simpler, non-browser python implementation,
which is probably more useful.

## Conceptual Design

See the documentation for the python version

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

## Miscellaneous

Thumbnail stuff leaves files in $TMPDIR
