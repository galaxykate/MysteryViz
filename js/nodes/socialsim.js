

let SocialSim = function(labelDiv) {
	this.graph = new ParticleSystem()

	this.people = []
	this.relationships = []

	for (var i = 0; i < 12; i++) {
		this.people[i] = new Person()
	}

	this.people.forEach((person, index) => {
		// Join the graph node and the person
		let p = Vector.polar(200 * Math.pow(Math.random(), .2), Math.random() * 6.29)
		p.person = person;
		p.person.id = index;
		person.graphPosition = p
		person.graphPosition.draw = function(g) {
			this.person.draw(g, this)
		}

		p.getLabel = function() {
			function valueToDiv(value) {
				return toTag("div", {
					class: "person-value",
					style: "color:" + value.color.toCSS() + ";"
				}, value.id)

			}
			let person = p.person
			return  toTag("div", {
					class: "person-name",
				}, person.name) + "\n" + valueToDiv(person.values[0]) + "\n" + valueToDiv(person.values[1])
		}
		this.graph.add(person.graphPosition)
	})

	this.graph.createLabels(labelDiv)

	// Add friendships
	for (var i = 0; i < 0; i++) {
		this.addRelationshipCircle(relationshipTypes[0])
	}

	// Add siblings
	for (var i = 0; i < 0; i++) {
		this.addRelationshipCircle(relationshipTypes[1])
	}

	//  Create two rival labs
	let people = shuffle(this.people.slice(0))
	let labCount = this.people.length - 2
	let lab0 = people.slice(0, Math.floor(labCount / 2))
	let lab1 = people.slice(Math.floor(labCount / 2), this.people.length - 2)
	let gk = people.slice(this.people.length - 2)

	// this.addLab(lab0)
	// this.addLab(lab1)


	people.forEach(p0 => {
		people.forEach(p1 => {
			if (p0 != p1 && p0.id < p1.id) {
				p0.values.forEach((v0) => {
					p1.values.forEach((v1) => {
						if (v0 === v1) {
							this.addRelationship(p0, p1, {
								type: "value",
								subtype: v0.id, 
							}, true)
						}
					})
				})
			}
		})
	})


}

SocialSim.prototype.addLab = function(ppl) {
	let lab0 = {
		labName: getRandom(["Xeno-", "Archeo-", "Experimental ", "Theoretical ", "Optical ", "Adaptive ", "Applied "]) +
			getRandom(["Astronomy", "Optics", "Biology", "Botany", "Physics", "Studies", "Culture", "Star Systems", "Engineering", "Optics"]),
		color: new KColor(Math.random(), .0, 1),
		labHead: ppl[0],
		students: ppl.slice(1)
	}

	lab0.labHead.isAdvisor = true
	ppl.forEach(p => p.lab = lab0)
	lab0.students.forEach(s => {
		this.addRelationship(s, lab0.labHead, {
			id: "studentOf",
			color: lab0.color.shade(.5)
		})
		this.addRelationship(lab0.labHead, s, {
			id: "advisorOf",
			color: lab0.color.shade(.3)
		})
	})

}

SocialSim.prototype.addRelationshipCircle = function(relationshipType) {

	let min = relationshipType.min
	let max = relationshipType.max
	let count = Math.floor(Math.random() * (1 + max - min) + min)
	let friends = utilities.getRandomUnique(this.people, count)

	for (var j = 0; j < friends.length; j++) {
		for (var k = 0; k < friends.length; k++) {
			if (k !== j) {
				this.addRelationship(friends[j], friends[k], relationshipType)
			}

		}
	}
}

SocialSim.prototype.getRelationship = function(a, b, relationshipType) {
	return this.relationships.filter(r => {
		return r.a === a && r.b === b && r.type === relationshipType
	})[0]

}
SocialSim.prototype.addRelationship = function(a, b, relationshipType, symmetrical) {
	if (this.getRelationship(a, b, relationshipType) === undefined) {
		// console.log("add relationship ", a.name, b.name, relationshipType)
		let classes = [relationshipType.type];
		if (relationshipType.subtype) 
			classes.push(relationshipType.subtype)
		
		let rel = {
			a: a,
			b: b,
			type: relationshipType,
			strength: Math.random(),
			edge: this.graph.addEdge(a.graphPosition, b.graphPosition, classes, symmetrical)
		}

// TODO, add symmetrical
		rel.edge.color = relationshipType.color
		this.relationships.push(rel)
	}
}


let names = ["Gabriel", "Mark", "Ana", "Pete", "Zed", "Jared", "Shirley", "Karen", "Penelope", "William", "Phillipa", "Yang", "Mina", "Mary", "Meredith", "Penny", "Robin", "Pedro", "Juana", "Luz", "Adam", "Joe", "Lee", "Dave", "Lupe", "Jane", "Bella", "JR", "Allen", "Ellen", "Olivia", "Greg", "CJ", "Ken", "Stephanie", "Karl", "Miryam", "Sarah", "Katherine", "Jim", "Michael", "Bea", "Jake", "John", "Sandy", "Lucia", "Hollis", "Holly", "Maisie", "Jasper", "Lane", "Lincoln", "Sterling", "Summer", "Miranda", "Maria", "Min", "Minnie", "Mariah", "Gus", "Dani", "Darius", "Elena", "Eduardo", "Elías", "Rajesh", "Ranjit", "Rex", "Rez", "Rey", "Yew", "Reba", "Jae-woo", "Ken", "Kira", "Jae", "Shah", "Josef", "Jørn", "Autumn", "Brandy", "Copper", "Cooper", "Harrow", "Manhattan", "Jo", "Jodi", "Karim", "Raf", "January", "Aku", "Juraj", "Yuri", "Kåre", "Lyn", "Jahan", "Mitch", "Alda", "Aimee", "Zoe", "London", "Paris", "Zuzu", "Zara", "Micah", "Song", "Sparrow", "Miguel", "Mikey", "Monette", "Michelina", "Agave", "Robyn", "Saffron", "Zeke", "Garth", "Rae", "Sebastian", "Seb", "Jake", "Bastion", "Luna", "Apple", "Delilah", "Jeremiah", "Finn", "Milo", "Finley", "April", "May", "September", "Kim", "Phineas", "Quincy", "Saul", "Rudy", "Cleo", "Noel", "Frankie", "June", "Rocky", "Pearl", "Harris", "Braxton", "Hamilton", "Ace", "Duke", "Rowan", "Stella", "Stevie", "Juniper", "Ryder", "Kai", "Judd", "Rhody", "Rho", "Sven", "Hazel", "Byron", "Edie", "Lola", "Poppy", "Jo", "Whisper", "Kaya", "Karim", "Kit", "Luca", "Rafa", "Miriam", "Aya", "Carmen", "Omar", "Anika", "Shan", "Luka", "Theo", "Emma", "Julian", "Adrian", "Ari", "Noah", "Maya", "Ariel"]



// Person generator
let Person = function() {
	this.name = getRandom(names)
	// this.values = [getRandom(values),getRandom(values) ]
	this.values = utilities.getRandomUnique(values, 2)

}


Person.prototype.draw = function(g, p) {
	// console.log("Custom draw")
	if (this.lab) {
		g.noFill()
		// this.lab.color.fill(g, 0,0)
		this.lab.color.stroke(g)

		g.ellipse(p.x, p.y, 10, 10)
		if (this.isAdvisor)
			g.ellipse(p.x, p.y, 14, 14)

	}
}