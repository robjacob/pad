#!/bin/sh
# Start up this system
# See README.md

case $HOSTTYPE in
pc)	# Windows/cygwin version, not fully implemented, see README.md

	echo This is not fully implemented for Windows yet

	(sleep 2

	start http://www.tufts.edu
	start front.html

	) &

	node back.js
	;;

*)	# Mac version, actually works

	# Sleep is cause want back.js to run last so it keeps the live tty window,
	# but want Safari not to load front.html page till back.js is running
	(sleep 2

	open -a Safari front.html

	# This stuff just tweaks the window size
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

	node back.js
	;;
esac
