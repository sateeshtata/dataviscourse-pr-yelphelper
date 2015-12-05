import json

with open("../output/business.json") as json_file:
    json_data = json.load(json_file)

businessesList = {}
groupLists = {}
states = []

for entry in json_data:
	state = str(entry["state"])

	categories = list(set([x.encode('UTF8') for x in entry["categories"]]))
	#categories = entry['categories']

	
	if state in businessesList:

		if len(categories) == 0:
			if "Miscellaneous" in businessesList[state]:
				businessesList[state]["Miscellaneous"] += 1
			else:
				businessesList[state]["Miscellaneous"] = 1

		else:
			checkFlag = True

			for i, x in enumerate(groupLists[state]):
				#print 'group lists:', groupLists[state]
				#print 'x value:', x

				if bool(set(categories) & set(x)):
					listDiff = set(x) - set(categories)
					x = x + list(listDiff)

					groupLists[state][i] = list(set(x))

					
					for business in categories:
						if business in businessesList[state]:
							businessesList[state][str(business)] += 1
						else:
							businessesList[state][str(business)] = 1

					checkFlag = False
					break

			if checkFlag:
				for business in categories:
					if business in businessesList[state]:
						businessesList[state][str(business)] += 1
					else:
						businessesList[state][str(business)] = 1

				groupLists[state].append(categories)

	else:
		businesses = {}
		groupLists[state] = [];

		states.append(state)

		if len(categories) == 0:
			businessesList[state]["Miscellaneous"] = 1
		else:
			for category in categories:
				businesses[str(category)] = 1

			businessesList[state] = businesses

			groupLists[state].append(categories)


print 'GroupLists: ', groupLists

print 'Businesses List: ', businessesList

# Building the JSON object
finalResult = {}
children = []

finalResult["name"] = "Businesses"

for area, groups in groupLists.items():
	areaResult = {}

	grpChildren = []

	for group in groups:
		groupResult = {}
		businessChildren = []

		rootBusiness = ""

		for business in group:

			if rootBusiness == "":
				rootBusiness = business
			else:
				if businessesList[area][business] > businessesList[area][rootBusiness]:
					rootBusiness = business

		groupResult["name"] = str(rootBusiness)

		for business in group:
			businessResult = {}

			if business != rootBusiness:
				businessResult["name"] = str(business)
				businessResult["size"] = businessesList[area][business]
				businessChildren.append(businessResult)


		groupResult["children"] = businessChildren

		grpChildren.append(groupResult)

	areaResult["name"] = str(area)
	areaResult["children"] = grpChildren

	children.append(areaResult)

finalResult["children"] = children


file_out = open("../output/sunBurst.json","w")
file_out.write("["+json.dumps(finalResult)+"]");
