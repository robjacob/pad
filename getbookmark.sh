# Collects optional data for making a bookmark
# We do it in one script here, rather than separate calls
# so we can do our stuff synchronously

# We return the items, each on a separate line;
# selection is optional, starts at 2nd line and may continue beyond

# This is Mac OS-specific, if using another OS, write an equivalent script,
# or forget about it, program will continue anyway with fallback values

# Fetch thumbnail (screendump the window, save to file, scale image, return file name to pass to front end)
windowid=`osascript -e 'tell application "Safari" to get id of item 1 of (get every window whose name is not "Front end")'`
tempfilename=`mktemp -t proj.brain.proto.pad`.png
screencapture -l$windowid $tempfilename
sips $tempfilename -Z 70 >/dev/null
echo $tempfilename

# Fetch clipboard selection if any
pbpaste -Prefer txt ; pbcopy </dev/null
echo ""
