let shieldSize = 300

// Show a tracery grammar as svg
$.getJSON( "../emoji-tracery.json", function( data ) {
	console.log("LOADED")
    // console.log(data.emojiSVGs); //json output 
    for (key in data){
		if (!Array.isArray(data[key]))
			data[key] = [data[key]]
		rawGrammar[key] = data[key].map(s => escapeTracery(s))

    }

}
    let rawGrammar = {
// 	foo: "bar",
// 	coffeeMod: ["iced", "decaf"],
// 	coffee: ["espresso", "latte", "chai", "coffee"],
// 	drink: "#size# #coffeeMod# #coffee#",
// 	// origin: "I had #drink.a#",

// 	setC0Metal: ["[c0:white][c0_name:Argent]", "[c0:yellow][c0_name:Or]"],
// 	setC0Color: ["[c0:red][c0_name:Gules]", "[c0:green][c0_name:Vert]", "[c0:black][c0_name:Sable]", "[c0:purple][c0_name:Purpure]", "[c0:blue][c0_name:Azure]"],
// 	setC1Metal: ["[c1:white][c1_name:Argent]", "[c1:yellow][c1_name:Or]"],
// 	setC1Color: ["[c1:red][c1_name:Gules]", "[c1:green][c1_name:Vert]", "[c1:black][c1_name:Sable]", "[c1:purple][c1_name:Purpure]", "[c1:blue][c1_name:Azure]"],
// 	setColorPair: ["#setC0Metal##setC1Color#", "#setC1Metal##setC0Color#"],
// 	r36: ["1", "2", "3", "4", "5", "10", "22", "23", "24", "25", "32", "33"],
// 	r10: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
// 	color: ["hsl(#r36#0,50%,#r10#0%)"],
// 	fieldVertical: `<rect  x="-125" y="-500" width="250" height="800" fill="#myColor#" />`,
// 	fieldSquare: `<rect  x="-250" y="-300" width="500" height="800" fill="#myColor#" />`,

// 	// Decorate
// 	verticalMask: `mask="url(\\#verticalMask)"`,


// 	// Do vertical emoji
// 	emojiVertical: [`[myEmoji:#emojiID#]<g transform="scale(2 2)">#emoji#</g>`, `[myEmoji:#emojiID#]<g transform="translate(0, 160)">#emoji#</g><g transform="translate(0, 0)">#emoji#</g><g transform="translate(0, -160)">#emoji#</g>`],

// 	// Divide vertically
// 	verticalDivide: [`<g transform="translate(0, -150) scale(.5,.5)" >#square#</g>\n
// 	<g transform="translate(0, 150) scale(.5,.5)">#square#</g>`],

// 	// verticalDetail: ["#emojiVertical#", "#emojiVertical#", "#verticalDivide#"],
// verticalDetail: ["#verticalDivide#"],

// 	verticalPair: [`<g transform="translate(-125, 0)" >[myColor:#c0#]#fieldVertical#\n#verticalDetail#</g>\n
// 	<g transform="translate(125, 0)" >[myColor:#c1#]#fieldVertical#\n#verticalDetail#</g>`],

// 	divide: [`#setColorPair##verticalPair#`],

// 	square: [`[myEmoji:#emojiID#][myColor:#color#]#fieldSquare##emoji#`],

	// art2: `<rect width="100%" height="100%" stroke="red" />`,
	// art: `<path d="#shieldPath#" stroke="red" />`,
	// emojiID: ["1F35e", "1F33b", "1F625", "1F427", "1F42B", "1F432", "1F439", "1F43E", "1F602", "2764", "1F60D", "1F612", "1F495", "1F44D", "2B05", "1F64F",
	// 	"1F622", "1F440", "1F494", "1F3B6", "1F64C", "1F49C", "2728", "1F3A5", "2744", "1F48E", "1F343", "1F4A6", "1F351", "1F37A", "2614", "1F478", "1F353", "1F35F", "1F369",
	// 	"1F377"
	// ],
	// emojiFile: ["https://upload.wikimedia.org/wikipedia/commons/9/92/Twemoji_#emojiID#.svg"],
	emojiFile: ["https://en.wikipedia.org/wiki/Emoji\\#/media/File:Noto_Emoji_Oreo_#emojiID#.svg"],
	// // emojiFile: ["emoji-svg/#myEmoji#.svg"],
	
	// //mask="url(\\#myMask)"
	// shieldGroup: `<g id="SHIELDART" transform="translate(300, 300)" mask="url(\\#myMask)" ><g transform="translate(0, -40)"> \n#divide#\n</g></g>`,
	// svg: `<svg version="1.1"
 //     baseProfile="full"
 //     width="600" height="600"
 //     xmlns="http://www.w3.org/2000/svg">#mask#\n\n#shieldGroup#</svg>`,



 text: `<text x="0" y="15" fill="red">I love SVG!😀</text>`,
 centerGroup2: `<g transform="translate(200, 200)" id="test"></g>`,
 centerGroup: `<g transform="translate(10, 10)" id="test">#emojiSVG#</g>`,
 emoji: ` <image x="-100" y="-100" width="200" height="200" xlink:href="#testPic#"/>`,
 testPic: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAh1BMVEVHcEz/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE3/zE1mRQDPojXZqjqziSd5Vgr1xEhwTQWfeB2zooCMZxPZ0b/su0OMdED18++DXg6DaDDisz/i3M+Wf1CWbxjs6N/////GmTC8kSupgCK8ro/GuZ/Pxa9wURCfi2B5XCBjMO3CAAAADXRSTlMA36/PgFCPIJ/vQL9g4e8akwAAAkFJREFUeF7tmNmu4jAMhmlLSwK1uy/sy1mXef/nmyH0RCImTfDM4Wq+GyQj/fJSy7EnI8zSZBHAQLBI0tmEQSwCIAQivk9llkiwIBN/v+YhjBLO/bwR4ER4eDWV4IGcutyJwJNo1KlYgjcyHgkL7sIanoA7ET46fCUBDIQrP/w8xcDEqN1MAhN53XoRsIlIgrhMSWDs4CyV538Dc/hL5oNQCCZZiVhm4GsPhwxRHVRkvna4ZCkBg6pGRV057JpECZGSFThQOOwaebs5Njiwcdk18c3ao2bETr+AYERo6bBrAlUzjke0bum/EUpJ8XnJhmSyAGCUn7BQuWZ8kDTboGC3iEYJ8ZuWCvHhC/0X2uXgpspJ2xrNX20QsTwW2RIsLLPiWCJiV123v9EiDWo23WvxkiuW6ueleO02qGmMFklIg/tiNG16FRlbKJ3MiNCpbw9btPLr0PYnJWQMpMAMbbt++sO+f2vblWK7utC2b/3+/N96awoF5uAvz0pfTw6+zjqlOf5jUjXlkwXtDzbk3SbpUP7s7Tr9Jx3cko7sEi8cTrdlTgdEJJEl9BHxjN+s3kmA6/cVfvN8XTNFaI4KrdV+7L9F9h/toEIHSXjrobVDL3bmQ0shaHB2aGDC8hht0Elje2lP4S6lxr5FRGSkWqCDNhpbIbIardQZXSHsS011RAtHY17HrjUr75CCXe5eRwUZA40RYN3suCtkXnQlKsquyH9uqRU/s67zDwgPOGkwjiwPOPswDlHs09hDj3X88+FvXybnvMjgRHsAAAAASUVORK5CYII="],

 // Pick out the main division
 selectDivision: "[type:fess]",

 origin: [`{svg <?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?><svg version=\"1.1\" width=\"600\" height=\"600\" viewBox=\"0 0 600 600\" style=\"enable-background:new 0 0 600 600;\" id=\"svg2\" xml:space=\"preserve\">#centerGroup#</svg>}`]
 // origin: "#emojiSVG#"
}

