import json
import random
import re
from pprint import pprint

emojiDataByCode = {}

emojiSkin = "🏿 🏻 🏼 🏽 🏾".split(" ")
emojiWithModifiers = "261D 26F9 270A 270B 270C 270D 1F385 1F3C2 1F3C3 1F3C4 1F3C7 1F3CA 1F3CB 1F3CB 1F442 1F443 1F446 1F447 1F448 1F449 1F44A 1F44B 1F44C 1F44D 1F44E 1F44F 1F44B 1F450 1F466 1F467 1F468 1F469 1F46E 1F470 1F471 1F472 1F473 1F474 1F475 1F476 1F477 1F478 1F47C 1F481 1F482 1F483 1F485 1F486 1F487 1F4AA 1F574 1F575 1F57A 1F590 1F595 1F596 1F645 1F646 1F647 1F64B 1F64C 1F64D 1F64E 1F64F 1F6A3 1F6B4 1F6B5 1F6B6 1F6C0 1F6CC 1F918 1F919 1F91A 1F91B 1F91C 1F91E 1F926 1F930 1F933 1F934 1F935 1F936 1F937 1F938 1F939 1F93D 1F93E".split(" ")
with open('emoji.json') as f:
    data = json.load(f)

    for item in data:
    	
    	for code in item["codes"].split(" "):
    		emojiDataByCode[code] = item


with open('emoji-freq.txt') as f:
	lines = f.read().split("\n")
	count = 0

	obj = {
		"emojiCode": [],
		"emojiID": [],
		"emojiSVG": [],
		"emojiChar": [],
		"setEmoji0": [],
		"setEmoji1": [],
		"setEmoji2": [],
		"setEmoji3": [],
	}



	idProperty = re.compile(r" id=\"[a-zA-Z0-9]*\"", re.IGNORECASE)
	clipPath = re.compile(r"clip-path=\"url\(#clipPath[a-zA-Z0-9]*\)\"", re.IGNORECASE)

	for line in lines:
		if count < 10:
			
			items = line.split("\t")
			if len(data) > 1 and random.random() > .0:
				code = items[0].split("-")[0]
				
				if code in emojiDataByCode:
					


					data = emojiDataByCode[code]

					name = data["name"]
					
					keywords = ",".join(data["keywords"].split(" | "))
					emoji = data["char"]
					codes = data["codes"].split(" | ")
					codesTxt = ",".join(codes)
					
					# if code in emojiWithModifiers:
					# 	print("modify " + emoji + emojiSkin[0])	
					
					
					words = re.split('\W+', name)
					id = "".join([words[0]] + [s2.capitalize() for s2 in words[1:]])
					
					
					try:
						with open('emoji-svg/%s.svg'%code) as svgFile:
							svg =  svgFile.read()
							svg = idProperty.sub("", svg)
							svg = clipPath.sub("", svg)
							
							
							start = max(svg.find("</defs>"), svg.find("<defs/>")) + 7
							if start <= 7:
								print("SVG oddity:")
								print(id)
								print(code)
							end = svg.find("</svg>")

							
							svg = svg[start:end]

							


							# print(svg)
							# obj["emojiCode_" + id] = codesTxt
							# obj["emojiName_" + id] = name
							# obj["emojiID_" + id] = id
							# obj["emojiSVG_" + id] = svg
							obj["emojiCode"].append(codes[0])
							obj["emojiID"].append(id)
							obj["emojiChar"].append(emoji)
							obj["emojiSVG"].append(svg)
							
							# obj["setEmoji%i"%i].append(s)
					except FileNotFoundError:
						print("No file for " + name)	

					# for i in range(0,4):

						# s = "[emojiCode_%i:%s]"%(i, codes)
						# s += "[emojiName_%i:%s]"%(i, name)
						# s += "[emojiKeyword_%i:%s]"%(i, keywords)
						# s += "[emoji_%i:%s]"%(i, emoji)

						# Load the svg
						
						
					count += 1
				else:
					print("missing code " + code)


	with open('emoji-tracery.json', 'w') as outfile:  
		json.dump(obj, outfile, indent=4)


favs = "1F3A0 1F393 1F392 1F609 1F60C 1F612 1F614 1F616 1F618 1F61E 1F620 1F621 1F628 1F629 1F62D 1F631 1F633 1F635 1F63A 1F63D 1F640 1F645"