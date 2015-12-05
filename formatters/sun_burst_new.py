import json

with open("../output/business.json") as json_file:
    json_data = json.load(json_file)

businessesList = {}
groupLists = {}
states = []

for entry in json_data:
	state = str(entry["state"])
	businessID = str(entry["business_id"])

	categories = list(set([x.encode('UTF8') for x in entry["categories"]]))
	#categories = entry['categories']

	
	if state in businessesList:

		if len(categories) == 0:
			if "Miscellaneous" in businessesList[state]:
				businessesList[state]["bus"]["Miscellaneous"]["count"] += 1
				businessesList[state]["bus"]["Miscellaneous"]["IDs"].append(businessID)
				businessesList[state]["IDs"].append(businessID)
			else:
				businessGroup = []
				businessGroup.append(businessID)
				businessesList[state]["bus"]["Miscellaneous"] = {}
				businessesList[state]["bus"]["Miscellaneous"]["count"] = 1
				businessesList[state]["bus"]["Miscellaneous"]["IDs"] = businessGroup
				businessesList[state]["IDs"].append(businessID)

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
							businessesList[state]["bus"][str(business)]["count"] += 1
							businessesList[state]["bus"][str(business)]["IDs"].append(businessID)
							businessesList[state]["IDs"].append(businessID)
						else:
							businessGroup = []
							businessGroup.append(businessID)
							businessesList[state]["bus"][str(business)] = {}
							businessesList[state]["bus"][str(business)]["count"] = 1
							businessesList[state]["bus"][str(business)]["IDs"] = businessGroup
							businessesList[state]["IDs"].append(businessID)

					checkFlag = False
					break

			if checkFlag:
				for business in categories:
					if business in businessesList[state]:
						businessesList[state]["bus"][str(business)]["count"] += 1
						businessesList[state]["bus"][str(business)]["IDs"].append(businessID)
						businessesList[state]["IDs"].append(businessID)
					else:
						businessGroup = []
						businessGroup.append(businessID)
						businessesList[state]["bus"][str(business)] = {}
						businessesList[state]["bus"][str(business)]["count"] = 1
						businessesList[state]["bus"][str(business)]["IDs"] = businessGroup
						businessesList[state]["IDs"].append(businessID)

				groupLists[state].append(categories)

	else:
		businesses = {}
		groupLists[state] = [];

		states.append(state)

		if len(categories) == 0:
			businessGroup = []
			businessGroup.append(businessID)
			businessesList[state]["bus"]["Miscellaneous"] = {}
			businessesList[state]["bus"]["Miscellaneous"]["count"] = 1
			businessesList[state]["bus"]["Miscellaneous"]["IDs"] = businessGroup
			businessesList[state]["IDs"].append(businessID)
		else:
			mainBusID = []
			for category in categories:
				businessGroup = []
				businessGroup.append(businessID)
				businesses[str(category)] = {}
				businesses[str(category)]["count"] = 1
				businesses[str(category)]["IDs"] = businessGroup

			mainBusID.append(businessID)

			businessesList[state] = {}
			businessesList[state]["bus"] = businesses
			businessesList[state]["IDs"] = mainBusID

			groupLists[state].append(categories)


print 'GroupLists: ', groupLists

print 'Businesses List: ', businessesList

# Building the JSON object
finalResult = {}
children = []

finalResult["name"] = "Businesses"
finalResult["business_ids"] = ['Hello', 'Hi', 'Test', 'Sample']

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
				if businessesList[area]["bus"][business]["count"] > businessesList[area]["bus"][rootBusiness]["count"]:
					rootBusiness = business

		groupResult["name"] = str(rootBusiness)

		for business in group:
			businessResult = {}
			rootBusinessIDS = []

			if business != rootBusiness:
				businessResult["name"] = str(business)
				businessResult["size"] = businessesList[area]["bus"][business]["count"]
				businessResult["business_ids"] = businessesList[area]["bus"][business]["IDs"]
				rootBusinessIDS.append(businessesList[area]["bus"][business]["IDs"])
				businessChildren.append(businessResult)


		groupResult["children"] = businessChildren
		groupResult["business_ids"] = rootBusinessIDS

		grpChildren.append(groupResult)

	areaResult["name"] = str(area)
	areaResult["children"] = grpChildren
	areaResult["business_ids"] = businessesList[area]["IDs"]

	children.append(areaResult)

finalResult["children"] = children


file_out = open("../output/sunBurstNew.json","w")
file_out.write("["+json.dumps(finalResult)+"]");
