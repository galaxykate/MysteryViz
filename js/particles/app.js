let tuning = {
	edgeStrength: {}, 
	baseEdgeStrength: 100,
	ease: .1
}

let relationshipTypes = [{
	id: "friend",
	min: 2,
	max: 4,
	color: new KColor(.46, .6, 1, -.1),
}, {
	id: "sibling",
	min: 2,
	max: 4,
	color: new KColor(.16, 1, 1, -.1),
}, {
	id: "lover",
	min: 2,
	max: 2,
	color: new KColor(.96, .6, 1, -.1),
}, {
	id: "labmate",
	top: "advisorOf",
	rest: "studentOf",
	min: 2,
	max: 4,
	color: new KColor(.56, .26, 1, -.1),
}]



let valueNames = ["science", "survival", "communalism", "funding", "comfort", "order", "faith", "progress", "friendship", "loyalty"]

let values = valueNames.map((name, index) => {
	return {
		id: name,
		name: name,
		color: new KColor((index * .13) % 1, .8 + .6 * Math.sin(index * 3), .5)
	}
})


$('document').ready(function() {

	// Create sliders
	let sliderDiv = $("#sliders")

	let strengthTypes = ["all", "labmate", "friend", "sharedvalue", "superior", "sub", "lover", "sibling"]
	strengthTypes.forEach(type => {
		let defaultValue = .5
		let tuningVal = {

			set: (newVal) => {
				slider.value(newVal)
			},
			val: defaultValue,
			slider: utilities.addSlider(sliderDiv, {
				key: type,
				value: defaultValue, 
				min: 0, 
				max: 1, 
				step: .02
			}, (newVal => {
				tuningVal.val = newVal
			})),

		}
	})



	let labelDiv = $("#pview .pview-label-center")
	let svg = $("#svg-layer")
	let w = svg.width()
	let h = svg.height()
	svg.attr("viewBox", -w/2 + " " + -h/2 + " " + w + " " + h)

	let sim = new SocialSim(labelDiv)



	// The particle system
	let system = sim.graph



	svg.html(system.toSVG())


	// Set the coloring
	values.forEach(v => {
		console.log( v.color.toCSS())
		console.log(v.id)
		$(".edge-" + v.id + " .arrowhead").attr({
			fill: v.color.toCSS(), 

		})
		$(".edge-" + v.id + " .shaft").attr({
			stroke: v.color.toCSS(), 

		})
	
	}) 


	let dt = .04
	let t = 0
	for (var i = 0; i < 320; i++) {
		t += dt
		system.update(dt, t)

	}

	let heldParticle = undefined
	let dragPos = new Vector()

	//  onUpdate, onDraw, onStart
	utilities.createProcessing($("#pview .pview-canvas"), (t) => {
		// On update
		system.update(t.elapsed, t.current)
	}, (g, t) => {
		// Drawing commands
		g.fill(0, 0, 0, .5)
		g.rect(-g.width / 2, -g.height / 2, g.width, g.height)

		
		system.draw(g, t.current)
		system.updateSVG()
	}, (g, t) => {
		// On init
	}, {
		// Drag handlers
		onDrag: (x, y) => {
			dragPos.setTo(x, y)
			if (heldParticle) {
				heldParticle.setTo(x, y)
			}
		},
		onStartDrag: (x, y) => {
			if (heldParticle)
				heldParticle.heldBy = undefined
			dragPos.setTo(x, y)
			heldParticle = system.getClosest(dragPos, 70)
			if (heldParticle)
				heldParticle.heldBy = dragPos
		},
		onStopDrag: (x, y) => {
			if (heldParticle)
				heldParticle.heldBy = undefined
		}
	})
});
