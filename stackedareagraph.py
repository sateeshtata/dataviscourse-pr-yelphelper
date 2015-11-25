import json
count=0;
with open("reviewss.json") as json_file:
	json_data = json.load(json_file)
list = []
for element in json_data:
	print element
	break
