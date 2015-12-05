import json
with open("business.json") as json_file:
    json_data = json.load(json_file)
category_count = []
list = []    
for entry in json_data:
	state = entry['state']
	categories = entry['categories']
	for i in categories:
		flag=0;
		flag1=0;
		for k in list:
			if k[1]==state and k[0]==i:
				k[2]+=1;
				flag=1;
				break;
		if flag==0: 
			new_list = []
			new_list.append(i)
			new_list.append(state)
			new_list.append(1)
			list.append(new_list)
		for k1 in category_count:
			if k1[0]==i:
				k1[1]+=1;
				flag1=1;
				break;
		if flag1==0:
			new_list = []
			new_list.append(i);
			new_list.append(1);
			category_count.append(new_list)

list.sort(key=lambda x: x[2],reverse=True)
category_count.sort(key=lambda x:x[1],reverse=True)
print category_count[:10]
cat=[]
for i in range(10):
	cat.append(category_count[i][0]);
print "\n\n\n\n\n\n\n",cat
file_out = open("bipartite.json","w")
file_out.write('[');
count=0;
for entry in list:
	if entry[0] in cat:
		file_out.write('{')
		file_out.write('"Category": "'+entry[0]+'", "State": "'+entry[1]+'", "Count": '+repr(entry[2])+'},\n')
file_out.write(']')
