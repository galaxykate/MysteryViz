let curveCount = 0
// Create a curve with some number of points

let theta0, theta1, kink0, kink1 = 0

function smoothBySegment(pts, onSegment) {
	let curvePower = .4
	let kinkDetangling = .3
	let cp0 = new Vector()
	let cp1 = new Vector()
	let offset0 = new Vector()
	let offset1 = new Vector()
	let m0, m1
	let dir = new Vector()
	for (var i = 0; i < pts.length; i++) {
		let p0 = pts[i - 1]
		let p1 = pts[i]
		let p2 = pts[i + 1]

		// Can we re-use offset1?
		if (p0) {
			offset0.setTo(offset1)
			offset0.m = offset1.m
		} else {
			offset0.mult(0)
			offset0.m = 0
		}

		if (p2) {
			offset1.setToDifference(p2, p1)
			offset1.m = offset1.magnitude()
			if (offset1.m > 0)
				offset1.div(offset1.m)
		} else
			offset1.mult(0)

		dir.setToAddMultiples(offset0, 1, offset1, 1)

		kink1 = Math.pow(Vector.dot(offset0, offset1) * .5 + .5, kinkDetangling)
		theta1 = dir.getAngle() + Math.PI

		if (p0) {
			cp0.setToPolarOffset(p0, kink0 * curvePower * offset0.m, theta0)
			cp1.setToPolarOffset(p1, kink1 * curvePower * offset0.m, theta1)
		}
		onSegment({
			theta0: theta0,
			theta1: theta1,
			p0: p0,
			p1: p1,
			p2: p2,
			cp0: cp0,
			cp1: cp1,
			offset0: offset0,
			offset1: offset1,
			dir: dir,
			kink0: kink0,
			kink1: kink1
		}, i)

		theta0 = theta1 + Math.PI
		kink0 = kink1
	}

}

function Curve() {
	this.id = curveCount++
		this.points = []
	this.shells = []
}


Curve.prototype.addPoints = function(pts) {
	pts.forEach(pt => this.addPoint(pt, 90, Math.random(), 90))
}

Curve.prototype.addPoint = function(pt, r0, theta0, r1, theta1) {
	let isSmooth = false
	if (theta1 == undefined) {
		isSmooth = true
		theta1 = theta0 + Math.PI
	}

	let cp = {
		radius: 10 + 59 * Math.random() * Math.random(),
		pt: pt,
		cp0: {
			r: r0,
			theta: theta0,

		},
		cp1: {
			r: r1,
			theta: theta1
		},
		isSmooth: isSmooth
	}

	this.points.push(cp)
	return cp
}



Curve.prototype.draw = function(g, t) {
	g.stroke(1)



	let m = .3

	// g.beginShape()
	// smoothCurve(this.points.map(p => p.pt), (first) => {
	// 	first.pt.vertex(g)
	// }, (last, current) => {
	// 	let p = current.pt

	// 	cp0.setToPolarOffset(last.pt, last.m * m, last.theta + Math.PI)
	// 	cp1.setToPolarOffset(current.pt, last.m * m, current.theta)
	// 	// current.pt.vertex(g)
	// 	g.bezierVertex(cp0.x, cp0.y, cp1.x, cp1.y, p.x, p.y)
	// }, (last) => {
	// 	last.pt.vertex(g)
	// })
	// g.endShape()


	smoothBySegment(this.points.map(p => p.pt), (p, index) => {
		this.points[index].theta = p.theta1
		this.points[index].kink = p.kink1

		// if (p.p0) {
		// 	g.stroke(.5, 1, 1)
		// 	g.fill(.5, 1, 1)
		// 	p.p0.drawArrowWithHead(g, p.offset0, p.offset0.m - 15, 10, 0, -5)
		// }
		// g.stroke(.7, 1, 1)
		// g.fill(.7, 1, 1)
		// p.p1.drawArrowWithHead(g, p.offset1, p.offset1.m - 15, 10, 0, 5)

		if (index > 0) {


			// g.stroke(1, 0, 1, 1)
			// p.p0.drawLineTo(g, p.cp0)
			// p.p1.drawLineTo(g, p.cp1)
			// g.noStroke()
			// g.fill(.3, 1, 1)
			// p.cp0.drawCircle(g, 4)
			// g.fill(.45, 1, 1)
			// p.cp1.drawCircle(g, 4)
		}

	})

	for (var i = 0; i < 30; i++) {
		let r = 1*Math.pow(i, 2) + 3
		let ptsOffset = this.points.map((pt, index) => {
			let p = new Vector(pt.pt)

			p.addPolar(r * pt.kink, pt.theta + Math.PI / 2)
			return p

		})
		g.noFill();
		g.stroke(1, 0, 1, .3 + .5*Math.sin(i*.5 + t*2));
		g.beginShape();
		smoothBySegment(ptsOffset, (p, index) => {
			if (index == 0) {
				p.p1.vertex(g)
			} else {
				g.bezierVertex(p.cp0.x, p.cp0.y, p.cp1.x, p.cp1.y, p.p1.x, p.p1.y)
			}

		})
		g.endShape();
	}
	g.noFill();
	g.stroke(1);
	g.beginShape();

	smoothBySegment(this.points.map(p => p.pt), (p, index) => {
		if (index == 0) {
			p.p1.vertex(g)
		} else {
			g.bezierVertex(p.cp0.x, p.cp0.y, p.cp1.x, p.cp1.y, p.p1.x, p.p1.y)
		}

	});
	g.endShape();

	// let drawCP = (p, cp) => {

	// 	p.drawPolarLine(g, cp.r, cp.theta)
	// 	g.noStroke()
	// 	p.drawPolarCircle(g, cp.r, cp.theta, 3)
	// }

	// this.points.forEach(p => {
	// 	g.fill(.74, 1, 1)
	// 	g.stroke(.9, .1, 1, .4)
	// 	drawCP(p.pt, p.cp0)
	// 	g.fill(.9, 1, 1)
	// 	g.stroke(.9, .1, 1, .4)
	// 	drawCP(p.pt, p.cp1)
	// })
	// g.noFill()
	// g.noStroke()
	// g.fill((t) % 1, .01, 1, .03)
	// g.stroke(1)

	// // g.fill(1, 0, 1, .1)
	// g.beginShape()

	// this.points.forEach(p => p.pt.vertex(g))
	// g.endShape()
	// g.strokeWeight(1.7)
	// this.drawBezier(g)
	// g.strokeWeight(.7)
	// for (var i = 0; i < 20; i++) {
	// 	g.stroke(1, .1, 1, .5 + .9 * Math.sin(i * .2 - t * 2))
	// 	this.drawShell(g, Math.pow(i, 1.22) * .2 + 1)
	// }


}

Curve.prototype.drawShell = function(g, m, start, end) {


	let v0 = new Vector()
	let v1 = new Vector()
	let v2 = new Vector()
	let v3 = new Vector()

	g.noFill()
	g.beginShape()

	this.iterate((p) => {
		g.vertex(p.pt.x, p.pt.y)
	}, (p0, c0, c1, p1) => {

		v0.setToPolarOffset(p0.pt, p0.radius * m, c0.theta + Math.PI / 2)
		v1.setToPolarOffset(v0, c0.r, c0.theta)
		v3.setToPolarOffset(p1.pt, p1.radius * m, c1.theta - Math.PI / 2)
		v2.setToPolarOffset(v3, c1.r, c1.theta)


		g.bezierVertex(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
	}, (p) => {}, start, end)

	g.endShape()



}

Curve.prototype.drawBezier = function(g, start, end) {
	g.stroke(1, (this.id * 1.2) % .5 + .8)
	g.beginShape()

	this.iterate((p) => {
		g.vertex(p.pt.x, p.pt.y)
	}, (p0, c0, c1, p1) => {

		g.bezierVertex(p0.pt.x + c0.r * Math.cos(c0.theta), p0.pt.y + c0.r * Math.sin(c0.theta),
			p1.pt.x + c1.r * Math.cos(c1.theta), p1.pt.y + c1.r * Math.sin(c1.theta),
			p1.pt.x, p1.pt.y);
	}, (p) => {}, start, end)
	g.endShape()
}


Curve.prototype.toSVGNoodle = function(start, end) {
	for (i = start; i < end - 1; i++) {
		let p0 = i
		let p1 = i + 1
	}

}