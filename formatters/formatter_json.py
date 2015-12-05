file = open('./output/review.json','r');
file_out = open('./output/review_formatted.json','w');
file_out.write('[');
fileData = file.read().splitlines();
file.close();

FileLength = len(fileData);
print FileLength;
for i, line in enumerate(fileData):
	if i == (FileLength-1):
		file_out.write(line+']');
		print line;
	else:
		file_out.write(line+',\n');
#file_out.write(']');