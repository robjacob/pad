# Connects to Evan's new python code (or to a simulation of it),
# but now assuming we get a line with comma-separated 5 floats
# R. Jacob  12/15/2013

# Should be able to run this with sys/matlab/New2Server.java

# Based on midi/python/lastpc/brainclient.py
# but simplified cause we only care about latest value

# Also see sys/matlab/notes

import socket
import sys

import pad

HOSTNAME = 'localhost'
PORTNUM = 10009  # Matches existing matlab code
	
class BrainClient:
	def __init__ (self):
		self.queueddata = []	

		self.sock = socket.socket (socket.AF_INET, socket.SOCK_STREAM)
		self.sock.connect ((HOSTNAME, PORTNUM))

	# Read some brain data from the socket and send it
	def getdata (self):
		# Refill the queue if it's empty
		if len(self.queueddata)==0:
			# Blithely assume each chunk will contain an integer number of lines
			# sock returns bytes, convert to str right here and work with str from here on
			self.chunk = self.sock.recv (1000).decode("utf-8")
			if self.chunk == '':
				self.sock.close()
				return None

			# Split the message into lines and enqueue each line
			for line in self.chunk.strip().splitlines():
				self.queueddata.append (line)

		# Return the first one, if any, leave the rest in the queue
		if len(self.queueddata)>0:
			ans = self.queueddata[0]
			self.queueddata = self.queueddata[1:]
			pad.doBrain (ans)

quit = False

# What the thread runs
def mainloop ():
	try:
		bclient = BrainClient ()
	except Exception:
		print ("Brainclient: can't connect, use on-screen sliders to simulate")
		return

	while not quit:
		bclient.getdata()

#
# UNIT TEST
#

if __name__=="__main__":
	# Mainly to warn if called from back.py
	print ("BRAINCLIENT.PY RUNNING UNITTEST")
	sys.stdout.flush()

	bclient = BrainClient()
	for i in range(100):
		print (bclient.getdata())
		sys.stdout.flush()

