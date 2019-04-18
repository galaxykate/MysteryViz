function toClosedTag(tagName, attributes) {
	var s = "<" + tagName;
	if (attributes) {
		$.each(attributes, function(key, val) {
			s += " " + key + "=" + inQuotes(val);
		});

	}
	s += "/>";
	return s;
}



function toTag(tagName, attributes, contents) {
	var s = "<" + tagName;
	if (attributes) {

		if (Array.isArray(attributes)) {
			$.each(attributes, function(key, attr2) {
				if (attr2 !== undefined) {
					$.each(attr2, function(key, val) {
						s += " " + key + "=" + inQuotes(val);
					});
				}
			});
		} else {

			$.each(attributes, function(key, val) {
				s += " " + key + "=" + inQuotes(val);
			});
		}
	}
	s += ">" + (contents ? contents : "") + "</" + tagName + ">";
	return s;
}

function inEscapedQuotes(s) {
	return '\\"' + s + '\\"';
}

function inQuotes(s) {
	return '"' + s + '"';
}

function inParens(s) {
	return '(' + s + ')';
}

function inBrackets(s) {
	return '[' + s + ']';
}

function createLabeledDiv(holder, label) {
	let div = $("<div/>", {
		class: "tracery-subsection",
	}).appendTo(holder)

	div.header = $("<div/>", {
		class: "tracery-subheader",
		html: label
	}).appendTo(div)

	div.content = $("<div/>", {
		class: "tracery-content",
	}).appendTo(div)

	return div
}


let subSectionsByType = {
	rule: ["ruleSections"],
	tag: ["ruleSource", "modifiers"],
	push: ["pushTarget", "ruleGenerator"],
	pop: ["pushTarget"],
	function: ["address", "parameters"]
}


function tracerySectionToViz(holder, section) {
	let type = section.syntaxType

	let div = $("<div/>", {
		class: "tracery-section tracery-section-" + type,
	}).appendTo(holder)

	let header = $("<div/>", {
		class: "tracery-header",
		html: toTag("span", {
			class: "tracery-syntaxtype tracery-syntaxtype-" + type
		}, section.syntaxType) + toTag("span", {
			class: "tracery-detail tracery-detail-" + type
		}, inQuotes(section.raw))
	}).appendTo(div)

	if (subSectionsByType[type]) {
		let content = $("<div/>", {
			class: "tracery-section",
		}).appendTo(div)

		subSectionsByType[type].forEach(subName => {
			if (section[subName]) {
				let div = createLabeledDiv(content, subName)
				if (Array.isArray(section[subName])) {
					if (section[subName].length === 0)
						div.remove()
					else
						section[subName].forEach(s2 => tracerySectionToViz(div.content, s2))
				} else {
					tracerySectionToViz(div.content, section[subName])
				}
			}
		})

	}


}