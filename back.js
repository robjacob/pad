/*
 * Does things we need that you can't do in a browser easily,
 * ie read on a port from the brain server code.
 * We read the data and hold it, we only return it when you ask us for it via xmlhttp
 */

"use strict";

var http = require("http");
var url = require("url");
var net = require("net")

// Port from front.js
const PORTNUM = "10099"

// Port from our matlab server code, matches existing matlab code
const BRAINPORTNUM = 10009 

var lineToSend = ""

/*
 * Set up to handle xmlhttp requests from front.js
 */
function start(portnum) {
	function onRequest(request, response) {
		console.log("Server: Handling request: " + request.url);
		
		// Parse request
		if (url.parse(request.url).query.endsWith ("brain")) {
			// Handle the request here synchronously
			response.writeHead (200, {"Content-Type": "text/plain"});
			response.writeHead (200, {"Access-Control-Allow-Origin": '*'});

			// Send our latest line of data
			response.write (lineToSend);
			response.end ();
		}
	}

	http.createServer(onRequest).listen(portnum);
	console.log ("Server: Starting");
}

start (PORTNUM)

/*
 * This reads from brain server, stashes data,
 * and returns it upon xmlhttp request above.
 */

var brainclient = net.createConnection (BRAINPORTNUM)

brainclient.setEncoding("UTF8");

brainclient.addListener ("error", function() {
	console.log("Brainclient: Use on-screen sliders to simulate instead");
	// NB lineToSend will forever stay at its initial value in this case
	brainclient.end ();
});

brainclient.addListener ("connect", function() {
	console.log("Brain Client: Connected");
});

brainclient.addListener ("data", function(data) {
	// Read everything available, and save only the last line for sending
	// Blithely assume each read will contain an integer number of lines, no fragments
	lineToSend = data.toString().trim().split ("\n").slice(-1)[0]
});
