import json

file_in = open("../output/barGraph.json","r");
file_out = open("../output/barGraphFormat.json","w");
for line in file_in:
 	split_lines = line.split(',')
 	print split_lines[2];
 	split_lines1=split_lines[2].split(':')[1].split("'")[1];
 	for i in range(0,len(split_lines)):
 		if(i!=2):
 			file_out.write(split_lines[i]);
 		else:
 			 file_out.write("'business_id':"+repr(split_lines1));
 		if(i!=len(split_lines)-1):
 			file_out.write( ',');
   


# file_out = open("../output/barGraph.json","w")
# file_out.write('[');
# fileLength = len(businessList)
# for i,entry in enumerate(businessList):
# 	if i == fileLength:
# 		file_out.write(str(entry)+']')
# 	else:
# 		file_out.write(str(entry)+',\n')
# file_out.write(']')
