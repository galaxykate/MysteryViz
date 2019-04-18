let dancerCount = 0;
function PatternDancer() {
	this.id = dancerCount++
	// DNA
	this.dna = []
	for (var i = 0; i < 20; i++) {
		this.dna[i] = [Math.random(), Math.random(), Math.random()]

	}
}

function dnaNoise(dna, t, speed) {

	let y = .1 * dna[1]
	let timeScale = Math.pow(1.5 * dna[0] + .04, 2)*speed
	return utilities.noise(t * timeScale, y)
}

PatternDancer.prototype.draw = function(g, t0, t1, yOffset) {
	let yStep = 25
	let steps = t1 - t0

	let pts = []


	for (var i = t0; i <= t1; i++) {
		let y = i * yStep + yOffset

		let x = 30 * dnaNoise(this.dna[0], i, 1)
		let theta = 30 * dnaNoise(this.dna[1], i, .02)
		let pt = new Vector(x, y)

		g.fill(1)
		
		g.pushMatrix()
		g.translate(pt.x, pt.y)
		g.rotate(theta)

		g.rect(0, 0, 30, 20)
		g.popMatrix()
		// console.log(pt)

	}
}

PatternDancer.prototype.update = function(dt, t) {
	for (var i = 0; i < this.dna.length; i++) {
		for (var j = 0; j < 3; j++) {
			this.dna[i][j] = .5 + .5*utilities.noise(i*10 + j*43, t*.12 + this.id*20)
		}
	}
}


function Pattern() {

	this.points = []
	this.dancers = []
	for (var i = 0; i < 10; i++) {
		this.dancers.push(new PatternDancer())
	}


	// for (var i = 0; i < 8; i++) {

	// 	let p = Vector.polar(Math.pow(Math.random(), .4) * 200, Math.random() * 6.28)
	// 	p.id = "p" + i
	// 	this.points.push(p)

	// }

	// this.system = new ParticleSystem()
	// this.points.forEach(p => this.system.add(p))

	// this.curves = []
	// for (var i = 0; i < 1; i++) {
	// 	// let curvePts = utilities.getRandomUnique(this.points, 20)
	// 	let c = new Curve()
	// 	c.addPoints(this.points)
	// 	this.curves.push(c)
	// }


	let holder = $(".pview-svg")

	let img = toTag("g", {
		id: "centerGroup",
		transform: `translate(${holder.width()*.5},${holder.height()*.5})`
	}, toTag("g", {
		id: "pointgroup",

	}))

	holder.html(`<?xml version="1.0" standalone="no"?><svg width="` + holder.width() + `" height="` + holder.height() + `" version="1.1" xmlns="http://www.w3.org/2000/svg">` + img + `</svg>`)

	this.pointgroup = $("#pointgroup")

	// this.createPoints()
}

Pattern.prototype.getClosest = function(p) {
	return this.system.getClosest(p)
}


Pattern.prototype.createPoints = function() {

	let ptSVG = this.points.map(p => {
		return toTag("g", {
				id: "svg-" + p.id,
			},

			// toTag("circle", {
			// 	cx: 0,
			// 	cy: 0,
			// 	r: 15,
			// 	fill: "none",
			// 	stroke: "cyan",
			// })
		)

	}).join("\n")


	this.pointgroup.html(ptSVG)
	console.log(this.points)

	this.points.forEach(p => p.svgGroup = $("#svg-" + p.id))


}

Pattern.prototype.draw = function(g, t) {

	// // g.ellipse(0, 0, 9, 9)
	// this.curves.forEach(c => c.draw(g, t))
	// g.noStroke()
	// g.fill(1, 0, 0, .5)
	// this.points.forEach((p, i) => p.drawCircle(g, 3))
	// this.points.forEach((p, i) => p.drawCircle(g, 4))
	// g.fill(1, .03, 1)
	// this.points.forEach((p, i) => p.drawCircle(g, 2))

	g.pushMatrix()
	g.translate(-g.width * .45, 0)
	this.dancers.forEach((d, i) => {
		d.draw(g, 0, 20, -g.height * .47)
		g.translate(g.width / this.dancers.length, 0)
	})
	g.popMatrix()
}


Pattern.prototype.update = function(dt, t) {
	// console.log("update")
	// $("#test").attr({
	// 	transform: `translate(${100*Math.random()},${Math.random()})`
	// })

	this.dancers.forEach((d, i) => d.update(dt, t))
	this.points.forEach((p, index) => {
		let r = 1.35
		let theta = 30 * utilities.noise(index + t * .01)
		p.x *= .996
		p.y *= .996
		p.addPolar(r, theta)
		p.svgGroup.attr({
			transform: `translate(${p.x},${p.y})`
		})
	})

	// this.curves.forEach(c => c.smooth())
}