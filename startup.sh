#!/bin/sh
# Start up this system

# This file is not really necessary, all you need to do is:
#	node back.js
#	Open a Safari window on ./front.html
#	Open another Safari window for regular browsing

# This system is for Mac, using Safari.
#	Also must 'Allow JavaScript from Apple Events' option in
#	Safari's Develop menu
#
#	Should work with different browsers on Mac,
#	change the applescript fragments in pad.py
#
#	Should work on windows, if you replace the applescript
#	fragments in pad.js with powerscript or other code that will
#	perform the same tasks

cmd="node back.js"

case $HOSTTYPE in
mac)	# Mac version, actually works

	# Sleep is cause want back.py to run last so it keeps the live tty window,
	# but want Safari not to load front.html page till back.py is running
	(sleep 2

	open -a Safari front.html

	# This stuff just opens up a second Safari window
	# and tweaks the window sizes
	osascript -e '
	tell application "Safari"
		activate
		delay 0.2

		--For now, just manually make sure all other Safari windows are closed, not sure why this fails: tell (every document whose name is not "Front end") to close
		set the bounds of the front window to {0, 30, 450, 700}

		make new document with properties {URL:"http://www.tufts.edu"}
		set the bounds of the front window to {460, 30, 1200, 700}
	end tell'

	) &

	$cmd
	;;

pc)	# Windows/cygwin version, not fully implemented, see above

	(sleep 2

	start http://www.tufts.edu
	start front.html

	) &

	$cmd
	;;
esac
