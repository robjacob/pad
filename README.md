# Multi-state Scratchpad Prototype

## Conceptual Design

You have many scratch pads

* Each is associated with a raw brain or other reading,
no classifiers, just index by set of features.

* You can just see different information on the scratch
pads, kind of like the peripheral display applications we have
already come up with

* And maybe you can write and read information on the 
scratchpads and they are kept separate

### Brain:

The selection by brain state applies to both input and output:

* Save: when you bookmark something, brain determines
which scratchpad it goes to.

* View: When you request information, brain determines
ordering of which scratchpad(s) you get, ie the ones associated
with similar (nearest neighbor) states to your current
state.

Maybe the choice of peripheral window is based on spatial
versus verbal or some other category like that

Maybe we use context and other information as well as
brain state to choose among several scratch
pads/window configurations, thinking again back to
activity-based window managers as an analogy

Some could be physiological and some could be brain

And maybe the bookmarks are marked with the [orthogonal]
dimension of interest or arousal, or maybe even just triggered
directly that way

### Further:
Have some explicit index terms for the scratchpads, eg 5:

* Select content, Hit Save,

* Think of one of 5 predefined distinctive thoughts
(like Donchin wheelchair commands) to pick which scratchpad.

* May be more useful with Glass, where input is more limited.

### View:

Press View button = displays the scratchpads ordered by distance
to current brain state. 

Avoid biofeedback effect, where the 2 peripheral windows
keep swapping as brain state changes. Maybe it's very subtle.
(*)Or it only shows up when you try to bookmark something.

Otherwise, could we blend smoothly between the two scratch pads, so
that if we guess wrong it's not terrible. So the system just makes one
or the other scratchpad more prominent but the other one is still
tucked away but available. And maybe new input goes to the more
prominent one. Kind of like the currently selected window in a
GUI. Input goes to the currently selected window, we switch to make
different windows currently selected based on your brain
state. Remember here that currently selected just means it's the
featured peripheral window, we're not messing with the main window.

### Save:

Press Save button = saves to the scratchpad that corresponds
to current brain state.

And the auxiliary display changes to the scratchpad you just
saved into? (which is usually the one that corresponds to your
current brain state, unless you used the pulldown override)

And we should provide some manual control for choosing
the currently selected [peripheral] window, so you can
override the guess that our brain state makes

You press a button to bookmark something, but we also record
the amount of interest you had in it.

### Nearest neighbor approach:

Save each bookmark along with its raw data, no classifier

### Retrieve:

Display *all* the items, ordered by distance,
and maybe shaded based on their distance.

Or something like:

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

* Shows last scratchpad that I saved into,
i.e., don't respond visually to changing brain state
(unless/until user pushes Save button)

* Sort by time

* Sort by interest level

* Visualize

Save button = You press a button to bookmark something, but we also record
the amount of interest you had in it.

* if you click it, it picks which scratchpad to use by your brain

* Save: if you select a region, we copy that (along
with URL of the page it was on), otherwise we just save the
URL.

View scratchpad(s)

* Displays nearby pads whenever you hit View

* Future: Also update when Save

* Continuously update as brain state changes?

* Not clear if the scratchpad(s) is always visible, just the
appropriate one, just the one that was last used, all of them?

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

    * change the applescript fragments in pad.py

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

## Things to Add

Show real brain state on GUI (via sliders or otherwise):
Problem is to send new data to browser unsolicited

Update displayed list whenever brain changes??
Ditto, problem is to send new data to browser unsolicited

Update displayed list whenever Save (see ../pad1):
Problem is to synchronize with child process

Click on a bookmark to send browser back to it:
(we don't really need this functionality for a long time)
