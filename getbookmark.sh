# Collects data for making a bookmark
# We do it in one script here, rather than separate calls
# so we can do our stuff synchronously

# We return the items, each on a separate line;
# selection is optional, starts at 4th line and may continue beyond

# Fetch URL from applescript
# these assume there's only one window other than our "Front end"
# NB see ./notes--IMPLEMENTATION: DORMANT/ABANDONED
osascript -e 'tell application "Safari" to do JavaScript "window.document.URL" in item 1 of (get every document whose name is not "Front end")'

# Fetch page "name" from applescript
osascript -e 'tell application "Safari" to do JavaScript "window.document.title" in item 1 of (get every document whose name is not "Front end")'

# Fetch thumbnail (screendump the window, save to file, scale image, return file name to pass to front end)
windowid=`osascript -e 'tell application "Safari" to get id of item 1 of (get every window whose name is not "Front end")'`
tempfilename=`mktemp -t proj.brain.proto.pad`.png
screencapture -l$windowid $tempfilename
sips $tempfilename -Z 70 >/dev/null
echo $tempfilename

# Fetch clipboard selection if any
pbpaste -Prefer txt ; pbcopy </dev/null
echo ""
