# Send a URL (given as command line arg) to our main browser window

# This is Mac OS-specific, if using another OS, write an equivalent script
osascript -e 'tell application "Safari" to do JavaScript "window.location.href = \"'$1'\"" in item 1 of (get every document whose name is not "Front end")'
