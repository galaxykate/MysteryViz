
let grammar, rawGrammar;

rawGrammar = {}

// Load a json grammar, and write it into the current grammar
function loadGrammar(grammarFile, onLoad) {
	$.getJSON( "../" + grammarFile, function( data ) {
		console.log("LOADED " + grammarFile)
		for (key in data) {
			rawGrammar[key] = data[key]
		}
		onLoad()
	})

}

function escapeTracery(s) {
	let s2 = s.replace(/#/g, "\\#")
	return s2
}

// Start and load a grammar
$(function() {
	console.log("load")
	loadGrammar("grammar-robots.json", () => {
		refreshGrammar()
	
	})
});


function refreshGrammar() {


	grammar = new tracery.TraceryGrammar(rawGrammar)
	let holder = $("#generated")
	holder.html("")
	for (var i = 0; i < 10; i++) {
		let node = grammar.expand("#origin#")
		holder.append($("<div>", {
			class: "tracery-generated",
			html:node.finishedValue}))
	}
	
	
}


