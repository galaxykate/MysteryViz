function parseProtected(contexts, startContext, s) {


	// Protection contexts define what characters are "special" and used to enclose other kinds of contexts


	let rootSection = {
		start: 0,
		end: s.length,
		inner: s,
		children: [],
		contextID: startContext,
	}

	let currentSection = rootSection
	currentContext = contexts[startContext]
	let stack = [currentSection]

	let lastText = 0


	addText = (i) => {
		if (lastText != i) {
			s2 = s.substring(lastText, i)

			// *Dreadful* hack to avoid removing any doubly-escaped slashes, 
			// using a *hopefully* unused part of the ascii space '⑊'
			// When fixing, test against: "escape this \\! but keep this slash\\\\ and both of these \\\\\\\\"
			// Note: fixed! Thanks @dognebula!
			// s2 = s2.replace(/\\\\/g, '⑊');
			// s2 = s2.replace(/\\/g, '');
			// s2 = s2.replace(/⑊/g, '\\');

			// Working!
			s2 = s2.replace(/\\(.)/g, m => m[1]);

			currentSection.children.push(s2)
		}
	}

	openSection = (i, c) => {

		addText(i)
		lastText = i + 1
		// Whats the context inside this section?
		let contextID = currentContext.innerContext[c]

		let section = {
			start: i,
			openChar: c,
			closeChar: currentContext.closeChar[c],
			children: [],
			contextID: contextID
		}

		currentSection.children.push(section)
		currentSection = section
		currentContext = contexts[contextID]
		if (currentContext === undefined)
			console.warn("No context for " + contextID + " in " + c)

		stack.push(section)

	}

	closeSection = (i, c) => {
		addText(i)
		currentSection.end = i
		currentSection.inner = s.substring(currentSection.start + 1, i)
		currentSection.raw = s.substring(currentSection.start, i + 1)
		stack.pop()
		currentSection = stack[stack.length - 1]

		// console.log("\t".repeat(stack.length) + "close section ")
		lastText = i + 1

		currentContext = contexts[currentSection.contextID]
	}

	var isEscaped = false
	// Parse some format into a tree
	for (var i = 0; i < s.length; i++) {

		// Ignore escaped characters
		if (isEscaped == true)
			isEscaped = false
		else {
			let c = s[i]

			if (c == "\\")
				isEscaped = true
			else {
				// Main switching

				// Closes a waiting section
				if (currentContext.isCloseChar[c] && currentSection.closeChar === c) {
					closeSection(i, c)
				}

				// Open a new section
				else if (currentContext.isOpenChar[c]) {
					openSection(i, c)
				}

				// Closer, but not of the current section (and not an opener either)
				else if (currentContext.isCloseChar[c]) {
					console.warn("\t".repeat(stack.length) + "unmatched " + c + " at " + i + ", expecting " + currentSection.closeChar)
				} else {
					// Do nothing? split?
				}
			}
		}
	}

	if (stack.length == 1)
		addText(i)


	return rootSection
}

function printSections(section, depth) {
	if (typeof section == "string") {
		console.log("\t".repeat(depth) + '"' + section + '"')
		return
	}


	if (depth === undefined)
		depth = 0

	console.log("\t".repeat(depth) + section.open + ' "' + section.inner + '"')
	section.children.forEach(s => printSections(s, depth + 1))

}


s = ["\\[foo(bar)[baz]\\] \\\\escape test and {something} #bar.baz(foo,[foo])# and (etc).", "foo.bar([baz.foo]).baz[whiz,was]", "[foo[bar() div][whiz(waz) etc]] fooooo"]
let closeCharByOpenChar = {
	"'": "'",
	"\"": "\"",
	"#": "#",
	"[": "]",
	"(": ")",
	"{": "}",
}
// Create protection contexts
let protectionContextsData = {
	inner: {
		"\"": "outer",
		"[": "inner",
		"#": "inner",
		"(": "inner",
		"{": "inner",
	},
	outer: {
		"#": "inner",
		"[": "inner"
	}
}

let protectionContexts = {}
for (contextName in protectionContextsData) {
	let context = {
		closeChar: {},
		isOpenChar: {},
		isCloseChar: {},
		innerContext: {},
		id: contextName
	}
	protectionContexts[contextName] = context

	for (opener in protectionContextsData[contextName]) {
		let closeChar = closeCharByOpenChar[opener]
		context.isOpenChar[opener] = true
		context.innerContext[opener] = protectionContextsData[contextName][opener]
		context.closeChar[opener] = closeChar
		context.isCloseChar[closeChar] = true

	}
}

function parseTraceryRule(s) {
	s1 = parseProtected(protectionContexts, "outer", s)
	// printSections(s1)
	return s1
}

function parseTraceryProtectedRule(s) {
	return parseProtected(protectionContexts, "inner", s)
}

// for (i in s) {
// 	section = parseProtected(protectionContexts, "outer", s[i])

// 	printSections(section)
// }

//======================================================

// Process a rule into sections, 
// then process each of those into meaningful tracery syntax trees

function sectionsToRaw(sections) {
	return sections.map(s => {
		if (typeof s === "string")
			return s
		return s.raw
	}).join("")
}

function toStringSection(s) {
	return {
		raw: s,
		syntaxType: "plaintext",
		children: []
	}
}

function parseRule(rule) {
	if (typeof rule === "string")
		rule = parseTraceryRule(rule)

	return parseSections(rule.children, "rule")

}

function parseSections(sections, type) {
	
	let parsed = {
		raw: sectionsToRaw(sections),
		syntaxType: type,
	}

	switch (type) {
		case "function":
			if (sections.length > 1 && sections[sections.length - 1].openChar === "(") {
				let parameterData = sections[sections.length - 1].children
				parsed.parameters = splitOnAll(parameterData).map(s => parseSections(s, "ruleGenerator"))
				parsed.address = parseSections(sections.slice(0, sections.length - 1), "key")
			} else {
				// Todo, dynamic key stuff
				return parseSections(sections, "key")
			}



		case "rule":
			parsed.ruleSections = sections.map(s => {
				if (typeof(s) === "string")
					return toStringSection(s)
				if (s.openChar === "[")
					return parseSections(s.children, "action")
				if (s.openChar === "#")
					return parseSections(s.children, "tag")
				if (s.openChar === "{") {
					let s2 = parseSections(s.children, "tag")
					s2.isProtected = true
					return s2
				}
				console.warn("Unknown rule section ", s)
			})
			return parsed;



		case "ruleGenerator":
			
			// Lots of kinds of rule generators
			if (sections.length === 1) {

				if (typeof sections[0] == "string") {

					parsed.syntaxType = "key"
					return parsed
				}

				// Protected rulegenerator
				if (sections[0].openChar == "[")
					return parseSections(sections[0].children, "ruleGenerator")

				else
					console.warn("unknown short rulegenerator", sections)
			}
			console.warn("complex rulegenerators not yet implemented", sections)
			return parsed;

		case "key":
			// TODO dynamic key stuff
			return parsed;
		case "tag":
			let subsections = splitOnAll(sections, ".")
			parsed.ruleSource = parseSections(subsections[0], "ruleGenerator")
			parsed.modifiers = subsections.slice(1).map(s => parseSections(s, "function"))

			return parsed;

		case "action":
			let sides = splitOnAll(sections, ":")
			if (sides.length == 2) {
				parsed.pushTarget = parseSections(sides[0], "ruleGenerator")

				let s1 = sides[1]

				if (s1.length === 1 && s1[0] === "POP") {
					parsed.syntaxType = "pop"
				} else {
					parsed.syntaxType = "push"

					// Get the sugared rules
					let rgSections = splitOnAll(s1, ",")

					// Is this a protected rule generator?
					if (rgSections.length === 1 && rgSections[0].openChar === "[") {
						
						parsed.ruleGenerator = parseSections(rgSections[0].children, "ruleGenerator")

					} else {
						// Parse this as an array of protected rules
						parsed.ruleGenerator = {
							syntaxType: "ruleGenerator",
							rgType: "ruleArray",
							rules: rgSections.map(s => parseSections(s, "rule"))
						}
					}
				}
				return parsed;

			} else {
				console.warn("non-implemented action:", sections)
			}

		default:
			console.log("No parsing defined for type: " + type)
	}


	return parsed

}


// Split these sections into lists of sections
// TODO: deal with escaped splitters, "," etc, left over 
function splitOnAll(sections, splitter) {

	let currentList = []
	let lists = [currentList]
	for (var i = 0; i < sections.length; i++) {
		let s = sections[i]

		if (typeof s === "string") {
			let start = 0
			let index = 0
			while (index >= 0) {
				// get the next index of the splitter
				index = s.indexOf(splitter, start)
				let s0
				// found?
				if (index >= 0) {
					s0 = s.substring(start, index)
					currentList.push(s0)
					// start a new list
					currentList = []
					lists.push(currentList)
					start = index + 1
				}
				// not found?
				else {
					s0 = s.substring(start)
					currentList.push(s0)
				}

			}

		} else {
			currentList.push(s)
		}
	}

	lists = lists.map(list => list.filter(s => !(typeof s === "string" && s.length === 0)))
	return lists
}

// splitOnAll(parseTraceryRule("[foo,bar]_test,bar,whiz#a,b,c#ard,alpha,beta,gamma").children, ",")