"use strict";

var http = require("http");
var url = require("url");
var net = require("net")

var pad = require("./pad")

var PORTNUM = "10099"

function start(portnum) {
	function onRequest(request, response) {
		console.log("Server: Handling request: " + request.url);
		
		var query = url.parse(request.url).query;
		var vars = query.split('&');
		var params = new Array;
		vars.forEach (function (value) {
			var pair = value.split('=');
			params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
		})

		response.writeHead (200, {"Content-Type": "text/plain"});
		response.writeHead (200, {"Access-Control-Allow-Origin": '*'});
		// Just handle doRequest synchronously
		response.write (pad.doRequest(params));
		response.end ();
	}

	http.createServer(onRequest).listen(portnum);
	console.log ("Server: Starting");
}

start (PORTNUM)

/*
 * Put brain client code here instead of a separate file
 */

var BRAINPORTNUM = 10009  // Matches existing matlab code

var brainclient = net.createConnection (BRAINPORTNUM)

brainclient.setEncoding("UTF8");

brainclient.addListener ("error", function() {
	console.log("Brainclient: can't connect, use on-screen sliders to simulate");
	brainclient.end ();
});

brainclient.addListener ("connect", function() {
	console.log("Brain Client: Connected");
});

brainclient.addListener ("data", function(data) {
	// Read everything available, and send each line individually
	// Blithely assume each read will contain an integer number of lines
	lines = data.toString().split ("\n")
	for (iline in lines) {
		line = lines[iline].trim();
		if (line!="") {
			console.log ("Brain Client: " + line);
			pad.doBrain (line);
		}
	}
});

/*
 * Tests
if (require.main === module) {
	pad.doRequest ({action: "brain", state: "10,20,30,40,50," })
	pad.doRequest ({action: "brain", state: "10,20,30,40,50," })
	pad.doRequest ({action: "brain", state: "11,20,30,40,50," })
	pad.doRequest ({action: "brain", state: "12,20,30,40,50," })
	pad.doRequest ({action: "brain", state: "80,20,30,40,50," })

	pad.doBrain (".4, 0, 0, 0, 0")
	pad.doBrain (".4, .55, 0, 0, 0")
}
 */

