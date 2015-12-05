import re
file_in = open('./TestData/yelp_academic_dataset_user.json','r')
file_out = open('./output/user.json','w')
for s in file_in:
	s = re.sub(r', "votes":.*"review_count":','"review_count":',s)
	output = re.sub(r', "friends": ".*"fans":', ',"fans":', s)
	file_out.write(output)