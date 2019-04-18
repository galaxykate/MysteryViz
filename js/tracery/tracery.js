// Create Tracery 

// UMD definition
(function(global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.tracery = mod.exports;
	}
})(this, function(exports) {
	"use strict";

	//======================================================
	function TraceryNode(context, template) {
		// The template of this node, contains instructions for expanding it
		this.template = template
		this.type = template.syntaxType
		this.context = context
	}

	TraceryNode.prototype.expand = function() {
		switch (this.type) {
			case "plaintext":
				this.finishedValue = this.template.raw;
				break;

			case "tag":

				this.ruleSource = new TraceryNode(this.context, this.template.ruleSource).expand()
				this.ruleset = this.context.getRuleset(this.ruleSource)
				this.ruleTemplate = this.context.selectFrom(this.ruleset)


				if (typeof this.ruleTemplate === "string")
					this.ruleTemplate = parseRule(this.ruleTemplate)

				if (this.ruleTemplate === undefined)
					this.ruleTemplate = toStringSection("((" + this.template.raw + "))")


				// Create the node for this rule, and expand it
				this.rule = new TraceryNode(this.context, this.ruleTemplate).expand()

				this.finishedValue = this.rule.finishedValue

				break;

			case "key":
				if (this.template.isDynamic)
					console.warn("Dynamic keys not implemented yet")
				this.finishedValue = this.template.raw
				break;

			case "rule":
				this.subnodes = this.template.ruleSections.map(s => new TraceryNode(this.context, s))
				this.subnodes.forEach(s => s.expand())
				this.finishedValue = this.subnodes.map(s => s.finishedValue).join("")
				break;

			case "push":
				console.log(this.template)
				this.pushTarget = new TraceryNode(this.context, this.template.pushTarget).expand()
				this.ruleGenerator = new TraceryNode(this.context, this.template.ruleGenerator).expand()

				this.ruleset = this.context.getRuleset(this.ruleGenerator)
				console.log(this.pushTarget)
				console.log(this.ruleset)
				this.context.pushRuleset(this.pushTarget.finishedValue, this.ruleset)


				this.finishedValue = ""
				break;
			case "ruleGenerator":
				if (this.template.rgType === "ruleArray") {
					this.finishedRuleNodes = this.template.rules.map(rule => new TraceryNode(this.context, rule).expand())
					this.finishedRules = this.finishedRuleNodes.map(n => n.finishedValue)

				} else
					console.warn("unknown rg type:", this.template.rgType)

			default:
				console.warn("expand " + this.type)
		}
		return this;
	}

	// Expand and callback when complete
	TraceryNode.prototype.expandAsync = function(callback) {

	}



	//======================================================


	//======================================================
	function TraceryGrammar(rawGrammar) {
		this.symbols = {}

		let key;
		for (key in rawGrammar) {
			let rules = rawGrammar[key]
			if (!Array.isArray(rules)) {
				rules = [rules]
			}
			this.symbols[key] = rules
		}

	}

	// Expand and then flatten this rule
	TraceryGrammar.prototype.flatten = function(rawRule, context) {
		return this.expand(rawRule, context).finishedValue
	}

	// Create a context, expand this rule
	TraceryGrammar.prototype.expand = function(rawRule, context) {
		console.log("expand:" + rawRule)

		// Preprocess this rule into sections, then into Tracery syntax
		let parsed = rawRule
		if (typeof rawRule === "string")
			parsed = parseRule(rawRule)

		// Create a context if we didn't get one
		if (context === undefined) {
			context = new TraceryContext(this)
		}

		// Create a node for this rule
		let rootNode = new TraceryNode(context, parsed)
		rootNode.expand()

		console.log(rootNode.finishedValue)
		return rootNode
	}

	//======================================================
	// Create a context to do expansions in
	// 
	function TraceryContext(grammar) {
		this.grammar = grammar
		this.overlays = {}
	}

	TraceryContext.prototype.pushRuleset = function(targetKey, rules) {
		console.log("PUSH" + targetKey, rules)
		if (this.overlays[targetKey] === undefined)
			this.overlays[targetKey] = []
		this.overlays[targetKey].push(rules)
	}

	TraceryContext.prototype.getRuleset = function(source) {
		console.log("get ruleset: " + source.finishedValue)
		if (source.type === "key") {
			let key = source.finishedValue

			// Check for overlays
			if (this.overlays[key]) {
				console.log("OVERLAY FOUND")
				return this.overlays[key][this.overlays[key].length - 1]
			}

			return this.grammar.symbols[key]
		}

		if (source.type === "ruleGenerator") {
			return source.finishedRules
		}
	}

	TraceryContext.prototype.selectFrom = function(ruleset) {

		if (ruleset === undefined)
			return undefined;

		return ruleset[Math.floor(Math.random() * ruleset.length)]
	}

	// expose Grammar to other modules
	exports.parseRule = parseRule;
	exports.TraceryGrammar = TraceryGrammar;
});