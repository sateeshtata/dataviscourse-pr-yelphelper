import json

with open("../output/review_formatted.json") as json_file:
    json_data = json.load(json_file)

businessList = []    

for entry in json_data:

	businessId = entry['business_id']
	stars = entry['stars']
	if not any(d['business_id'] == businessId for d in businessList):
		print 'in if'
		if stars == 5:
			businessList.append({'business_id': businessId, '5_stars': 1, '4_stars': 0, '3_stars': 0, '2_stars': 0, '1_stars': 0, 'total': 1})
		elif stars == 4:
			businessList.append({'business_id': businessId, '5_stars': 0, '4_stars': 1, '3_stars': 0, '2_stars': 0, '1_stars': 0, 'total': 1})
		elif stars == 3:
			businessList.append({'business_id': businessId, '5_stars': 0, '4_stars': 0, '3_stars': 1, '2_stars': 0, '1_stars': 0, 'total': 1})
		elif stars == 2:
			businessList.append({'business_id': businessId, '5_stars': 0, '4_stars': 0, '3_stars': 0, '2_stars': 1, '1_stars': 0, 'total': 1})
		else:
			businessList.append({'business_id': businessId, '5_stars': 0, '4_stars': 0, '3_stars': 0, '2_stars': 0, '1_stars': 1, 'total': 1})

	else:
		print 'in else'
		for d in businessList:
			if d['business_id'] == businessId:
				if stars == 5:
					d['5_stars'] = d['5_stars'] + 1
					d['total'] = d['total'] + 1
				elif stars == 4:
					d['4_stars'] = d['4_stars'] + 1
					d['total'] = d['total'] + 1
				elif stars == 3:
					d['3_stars'] = d['3_stars'] + 1
					d['total'] = d['total'] + 1
				elif stars == 2:
					d['2_stars'] = d['2_stars'] + 1
					d['total'] = d['total'] + 1
				else:
					d['1_stars'] = d['1_stars'] + 1
					d['total'] = d['total'] + 1


file_out = open("../output/barGraph.json","w")
file_out.write('[');
fileLength = len(businessList)
for i,entry in enumerate(businessList):
	if i == fileLength:
		file_out.write(str(entry)+']')
	else:
		file_out.write(str(entry)+',\n')
file_out.write(']')
