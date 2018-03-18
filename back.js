/*
 * Runs on node.js and does things we need that you can't do in a browser easily, ie:
 * Get bookmark data from browser
 * Send URL to browser
 * Read on a port from the brain server code.
 *
 * We read the brain data and hold it, we only return it when you ask
 * us for it via xmlhttp
 */

"use strict";

var http = require("http");
var url = require("url");
var net = require("net")
var child_process = require ('child_process')

// Port from front.js
const PORTNUM = "10099"

// Port from our matlab server code, matches existing matlab code
const BRAINPORTNUM = 10009 

// Saved brain data to send when asked
var lineToSend = ""

/*
 * Set up to handle xmlhttp requests from front.js
 * and process each kind of request
 */
function start(portnum) {
	function onRequest(request, response) {
		console.log("Server: Handling request: " + request.url);
		
		// Parse request
		var query = url.parse(request.url).query

		// Every case needs this
		response.writeHead (200, {"Content-Type": "text/plain"});
		response.writeHead (200, {"Access-Control-Allow-Origin": '*'});

		// Process the specific request
		if (query == "getbookmark") {
			// We get all the data for a bookmark in this one script,
			// to avoid further asynchronous callback ugliness
			child_process.exec ("sh getbookmark.sh", function(error, stdout, stderr) { 
				if (error!=null) console.error ("getbookmark.sh returned error: " + error);
				if (stderr!="") console.error ("getbookmark.sh returned stderror: " + stderr);
				response.write (stdout)
				response.end ();
			})
		}

		else if (query.startsWith ("sendbookmark")) {
			// Execute the command, expect no response
			child_process.exec ("sh sendbookmark.sh '" + query.split('&')[1] + "'", function(error, stdout, stderr) {
				if (error!=null) console.error ("sendbookmark.sh returned error: " + error);
				if (stderr!="") console.error ("sendbookmark.sh returned stderror: " + stderr);
				response.end ();
			})
		}

		else if (query == "brain") {
			// Handle the request here, synchronously,
			// send our latest line of data
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
