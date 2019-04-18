// Particle mixins



function ParticleSystem() {

	
	this.gravity = .50
	this.wander = .0
	this.drag = .8
	this.spacing = .2

	spacingRange = 150

	this.particles = []
	this.edges = []

	this.particleForces = [{

		id: "gravity",
		applyTo: (p, force, t) => {
			force.setToMultiple(p, -this.gravity)
		}
	}, 
	// {
	// 	id: "wander",
	// 	applyTo: (p, force, t) => {
	// 		let r = this.wander * 10 / (2 + Math.pow(t, .5))
	// 		let m = .001
	// 		let theta = 20 * utilities.noise(m * p.x, m * p.y, t * .001)
	// 		force.setToPolar(r, theta)
	// 	}
	// }, 

	{
		id: "spacing",
		applyTo: (p, force, t) => {

			force.setTo(.0, 0, 0);
			let offset = new Vector()
			for (var i = 0; i < this.particles.length; i++) {
				let p2 = this.particles[i]

				if (p !== p2) {
					offset.setToDifference(p2, p)

					let d = offset.magnitude()
					if (d > 0) {
						let range = spacingRange*.9

						// are we too close?
						if (d < range) {
							let f =  (range-d)/range
							f = Math.pow(f, .4)
							// force from 0 to 1
							
						


							force.addMultiple(offset, -200 * f / d)
						}
					}
				}
			}

		}
	}]

	this.edgeForces = []
}

ParticleSystem.prototype.createLabels = function(labelDiv) {
	this.particles.forEach(p => {
		p.particle.labelDiv = $("<div/>", {
			"class": "node-label",
			html: p.getLabel()
		}).appendTo(labelDiv)
	})
}


ParticleSystem.prototype.getClosest = function(query, maxDist) {
	if (maxDist == undefined)
		maxDist = 50
	let minDist = maxDist;
	let best = undefined

	for (let i = 0; i < this.particles.length; i++) {
		let p = this.particles[i]
		let d = p.getDistanceTo(query)
		if (p.radius !== undefined)
			d -= p.radius

		if (d < minDist) {
			best = p
			minDist = d
		}
	}

	return best

}


let particleCount = 0
ParticleSystem.prototype.add = function(p) {


	p.id = particleCount++
	if (p.particle === undefined) {

		p.particle = {
			v: new Vector(),
			totalForce: new Vector(),
			edgeForce: new Vector(),
			forces: []

		}

		this.particles.push(p)
	}

}



ParticleSystem.prototype.addEdge = function(a, b, classes) {
	e = new Edge(a, b, classes)
	this.edges.push(e)
	return e
}


ParticleSystem.prototype.update = function(dt, t) {

	// Set forces
	for (var i = 0; i < this.particles.length; i++) {
		let p = this.particles[i];

		p.particle.totalForce.mult(0)
		p.particle.edgeForce.mult(0)
	}

	// Update edge forces
	for (var j = 0; j < this.edges.length; j++) {
		let e = this.edges[j]
		e.update(dt, t)
	}

	// Add the edge force to the particles
	for (var i = 0; i < this.particles.length; i++) {
		let p = this.particles[i].particle;
		p.totalForce.add(p.edgeForce)
	}

	// Calculate each of the particle forces
	for (var i = 0; i < this.particleForces.length; i++) {
		let force = this.particleForces[i]
		for (var j = 0; j < this.particles.length; j++) {

			let p = this.particles[j]

			if (p.particle.forces[i] === undefined) {
				p.particle.forces[i] = new Vector()
				p.particle.forces[i].force = force
			}
			let pf = p.particle.forces[i]

			// Apply the force to the particle
			force.applyTo(p, pf, t)
			p.particle.totalForce.add(pf)
		}
	}


	// Move the particle
	for (var i = 0; i < this.particles.length; i++) {
		let p = this.particles[i];
		if (p.heldBy) {
			p.setTo(p.heldBy)
		} else {

			p.particle.v.addMultiple(p.particle.totalForce, dt)
			// limitVectorMagnitude(p.particle.v, 100, .4)
			p.particle.v.mult(Math.pow(this.drag, dt))
			p.addMultiple(p.particle.v, dt)

		}

		if (p.particle.labelDiv)
			p.particle.labelDiv.css({
				transform: "translate(" + p.x + "px, " + p.y + "px)"
			})

	}

	// Perform easing
	for (var j = 0; j < 0; j++) {

		for (var i = 0; i < this.edges.length; i++) {
			this.edges[i].ease(dt)
		}
	}

}

ParticleSystem.prototype.drawForces = function(g) {


	let arrowLength = .2
	for (var i = 0; i < this.particles.length; i++) {
		let p = this.particles[i];
		// draw forces
		for (var j = 0; j < this.particleForces.length; j++) {
			if (p.particle.forces[j]) {

				let h = (j * .3 + .2) % 1
				g.stroke(h, 1, 1)
				g.fill(h, 1, 1)
				p.drawArrowWithHead(g, p.particle.forces[j], arrowLength, 5, 0, 0)

			}

		}
	}
}

ParticleSystem.prototype.toSVG = function() {
	let svg = ""
	svg += this.edges.map(e =>e.toSVG() ).join("")
	console.log(svg)
	
	svg += this.particles.map(p => toTag("g", {
		id: "particle_" + p.id,
		transform: `translate(${p.x}, ${p.y})`
	}, 
	toTag("ellipse", {
		cx: 0, 
		cy: 0,
		rx: 8,
		ry: 8,
		stroke: "black",
		"stroke-width": 4,
		fill: "white"
	})

	)).join("");
	
	return svg;
}


ParticleSystem.prototype.updateSVG = function() {

	this.particles.forEach(p => {

		$("#particle_" + p.id).attr({
			transform: `translate(${p.x}, ${p.y})`
		})
	})

	this.edges.forEach(e => {
		e.updateSVG()
		
	})
	
}

ParticleSystem.prototype.draw = function(g) {

	// for (var i = 0; i < this.edges.length; i++) {
	// 	let e = this.edges[i]
	// 	// Draw override?
	// 	if (e.draw !== undefined) {

	// 	} else {


	// 		if (e.color) {
	// 			e.color.stroke(g)
	// 			e.color.fill(g)
	// 		} else {
	// 			g.stroke(1, .4)
	// 			g.fill(1)
	// 		}

	// 		// e.start.drawEndOffsetLineTo(g, e.end, 6, 6, 3, 3)
	// 		e.start.drawArrowWithHead(g, e.offset, 1, 5, -8, 2)
	// 	}

	// }

	// for (var i = 0; i < this.particles.length; i++) {
	// 	let p = this.particles[i];

	// 	g.fill((i * .01) % 1, 1, 1)
	// 	g.noStroke()

	// 	p.drawCircle(g, 5)
	// 	if (p.heldBy) {
	// 		g.stroke((i * .01) % 1, 1, 1)
	// 		g.noFill()

	// 		p.drawCircle(g, 15)
	// 	}

	// 	if (p.draw)
	// 		p.draw(g)
	// }

	// this.drawForces(g)
}

let edgeCount = 0

function Edge(start, end, classes) {
	this.classes = classes
	this.baseLength= 0 + 20 * Math.random();
	this.start = start;
	this.end = end;
	this.length = 0;
	this.id= edgeCount++;
	this.offsetAngle = .2*Math.random()

	this.stretch= 0;
	this.offset  =  new Vector()
	this.normal = new Vector()

}

Edge.prototype.update = function() {
	this.length = this.start.getDistanceTo(this.end)
	this.offset.setToDifference(this.end, this.start)
	this.stretch = this.length - this.baseLength
	this.normal.setTo(this.offset.y, -this.offset.x)

}


Edge.prototype.addForces= function() {
	if (this.length !== 0) {
		// Add a force to the end particles
		let f = this.stretch * tuning.edgeStrength.all*baseEdgeTuning / this.length
		this.start.particle.edgeForce.addMultiple(this.offset, f)
		this.end.particle.edgeForce.addMultiple(this.offset, -f)
	}
}

Edge.prototype.ease = function(dt) {
	let ease = tuning.ease
	this.update()



	if (this.length > 0) {
		let easeDist = Math.max(.2, ease * dt * this.stretch)



		e.start.addMultiple(e.offset, easeDist / this.length)
		e.end.addMultiple(e.offset, -easeDist / this.length)
	}
}

Edge.prototype.toSVG = function() {
	console.log(this.classes)
	return toTag("g", {
		id: "edge-" + this.id,
		class: this.classes.map((c, index) => "edge-" + c).join(" ")
	}, toTag("path", {
		class: "shaft",
		stroke: "white",
		fill: "none",

	}) + toTag("path", {
		class: "arrowhead", 
		d: "M0 0 L3 10 L-3 10 Z",
		fill: "white"
	}))
}

Edge.prototype.updateSVG = function() {
	let v = new Vector()

	let d = this.offset.magnitude()*.4
	let theta = this.offset.getAngle()
	let pathData = `M${this.start.toSVG()}`


	v.setToLerp(this.start, this.end, 0)
	v.addPolar(d, theta + this.offsetAngle)
	pathData += `C ${v.toSVG()}`
	v.setToLerp(this.start, this.end, 1)
	v.addPolar(d, Math.PI + theta - this.offsetAngle)
	pathData += ` ${v.toSVG()}`

	pathData += ` ${this.end.toSVG()}`
	$("#edge-" + this.id + " .shaft").attr("d", pathData)
	$("#edge-" + this.id + " .arrowhead").attr({
		// "transform" : this.end.toCSSTranslate(),
		"transform" :  this.end.toCSSTranslate() + `, rotate(${(Math.PI/2 + theta - this.offsetAngle)*180/Math.PI}), translate(0, 10)`
	})



	
}