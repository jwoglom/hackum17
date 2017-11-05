#!/usr/bin/python3
import sys
print(sys.argv)
if len(sys.argv) < 2:
	print("Provide the file to be converted as a single command-line argument.")
else:
	fname = sys.argv[1]
	output = fname.split('.')[0]+".txt"
	open(output, "wb").write(__import__("base64").b64encode(open(fname,"rb").read()))
	print("Output filename:", output)