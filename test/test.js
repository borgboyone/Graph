	/* Point related functionality */
	test(function() {
		var point = new aw.Graph.Point(0,0);
		assert_true(point instanceof aw.Graph.Point );
		assert_true(point.x == 0);
		assert_true(point.y == 0);
	}, "Point.constructor");
	test(function() {
		var point = new aw.Graph.Point(0,0);
		assert_true(aw.Graph.Point.isInstance(point));
	}, "Point.isInstance");
	test(function() {
		var point = new aw.Graph.Point(0,0);
		assert_readonly(point.x);
		assert_readonly(point.y);
	}, "Point is ReadOnly");
	test(function() {
		var point1 = new aw.Graph.Point(0,0),
			point2 = new aw.Graph.Point(0,0);
		assert_true(point1.equals(point2));
		assert_true(point2.equals(point1));
	}, "Point.equals(true)");
	test(function() {
		var point1 = new aw.Graph.Point(0,0),
			point2 = new aw.Graph.Point(1,1);
		assert_false(point1.equals(point2));
		assert_false(point2.equals(point1));
	}, "Point.equals(false)");
	test(function() {
		var point1 = new aw.Graph.Point(1,1),
			point2 = point1.clone();
		assert_false(point1 === point2);
		assert_true(point1.equals(point2));
	}, "Point.clone");
	test(function() {
		var point1 = new aw.Graph.Point(0,0),
			point2 = new aw.Graph.Point(2,2);
		assert_equals(aw.Graph.Point.distance(point1, point2), 2*Math.sqrt(2));
	}, "Point.distance");
	/* Point Errors */
	test(function() {
		assert_throws({name: 'Error', message: "Parameter 1 (x) of Point.constructor must be of type number"}, function() { new aw.Graph.Point("cow", 0)},
			"Parameter 1 (x) of Point.constructor must be of type number");
	}, "Point.constructor parameter 1 number check");
	test(function() {
		assert_throws({name: 'Error', message: "Parameter 2 (y) of Point.constructor must be of type number"}, function() { new aw.Graph.Point(0, "cow")},
			"Parameter 2 (x) of Point.constructor must be of type number");
	}, "Point.constructor parameter 2 number check");
	test(function() {
		assert_throws({name: 'Error', message: "Point called in static context; use new Point() instead"}, function() { aw.Graph.Point(0,0)});
	}, "Point constructor called without new check");
	test(function() {
		assert_throws({name: 'Error', message: "Parameter 1 (point) of Point.equals must be of type Point"}, function() { (new aw.Graph.Point(0,0)).equals("cow")});
	}, "Point.equals parameter 1 Point check");
	test(function() {
		assert_throws({name: 'Error', message: "Parameter 1 (p0) of Point.distance must be of type Point"}, function() { aw.Graph.Point.distance("cow", new aw.Graph.Point(0,0))});
	}, "Point.distance parameter 1 Point check");
	test(function() {
		assert_throws({name: 'Error', message: "Parameter 2 (p1) of Point.distance must be of type Point"}, function() { aw.Graph.Point.distance(new aw.Graph.Point(0,0), "cow")});
	}, "Point.distance parameter 2 Point check");

	/* Vector related functionality */

	/* LineSegment related functionality */
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(1,1));
		assert_true(ls instanceof aw.Graph.LineSegment);
		assert_true(ls.p0.x == 0);
		assert_true(ls.p0.y == 0);
		assert_true(ls.p1.x == 1);
		assert_true(ls.p1.y == 1);
	}, "LineSegment.constructor");
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(1,1));
		assert_true(aw.Graph.LineSegment.isInstance(ls));
		assert_false(aw.Graph.LineSegment.isInstance("cow"));
	}, "LineSegment.isInstance");
	test(function() {
		var ls1 = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(1,1)),
			ls2 = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(1,1)),
			ls3 = new aw.Graph.LineSegment(new aw.Graph.Point(1,1), new aw.Graph.Point(0,0));
		assert_true(ls1.equals(ls2));
		assert_true(ls2.equals(ls1));
		assert_true(ls1.equals(ls3));
		assert_true(ls3.equals(ls1));
	}, "LineSegment.equals(true)");
	test(function() {
		var ls1 = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(1,1)),
			ls2 = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(0.5,0.5));
		assert_false(ls1.equals(ls2));
		assert_false(ls2.equals(ls1));
	}, "LineSegment.equals(false)");
	test(function() {
		var ls1 = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(1,1)),
			ls2 = ls1.clone();
		assert_false(ls1 === ls2);
		assert_true(ls1.equals(ls2));
	}, "LineSegment.clone");
	// length
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(0,0), new aw.Graph.Point(2,2));
		assert_equals(ls.length(), 2*Math.sqrt(2));
	}, "LineSegment.length");
	// can we put these into a matrix?  Let's try to do that
	/*0, 1,1 contains 0,0 0.5,0.5 1.0,1.0 -1,-1*/
	var lsTest1 = {
		p0: [0,0],
		p1: [1,1],
		contains: [[0,0], [0.5,0.5], [1.0,1.0]]
	};
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest1.p0[0],lsTest1.p0[1]), new aw.Graph.Point(lsTest1.p1[0],lsTest1.p1[1]));
		lsTest1.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_true(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(true) Primary");
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest1.p1[0],lsTest1.p1[1]), new aw.Graph.Point(lsTest1.p0[0],lsTest1.p0[1]));
		lsTest1.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_true(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(true) Primary Reversed");
	var lsTest2 = {
		p0: [-1,0],
		p1: [-1,1],
		contains: [[-1,0], [-1,0.5], [-1,1]]
	};
	test(function() {
		console.log("Secondary");
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest2.p0[0],lsTest2.p0[1]), new aw.Graph.Point(lsTest2.p1[0],lsTest2.p1[1]));
		lsTest2.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_true(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(true) Secondary");
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest2.p1[0],lsTest2.p1[1]), new aw.Graph.Point(lsTest2.p0[0],lsTest2.p0[1]));
		lsTest2.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_true(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(true) Secondary Reversed");
	var lsTest4 = {
		p0: [-1,0],
		p1: [0,0],
		contains: [[-1,0], [-0.5,0], [0,0]]
	}
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest4.p0[0],lsTest4.p0[1]), new aw.Graph.Point(lsTest4.p1[0],lsTest4.p1[1]));
		lsTest4.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_true(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(true) Tertiary");
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest4.p1[0],lsTest4.p1[1]), new aw.Graph.Point(lsTest4.p0[0],lsTest4.p0[1]));
		lsTest4.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_true(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(true) Tertiary Reversed");
	var lsTest3 = {
		p0: [0,0],
		p1: [1,1],
		contains: [[0,1], [-1,-1], [1.5,1.5], [1,0]]
	};
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest3.p0[0],lsTest3.p0[1]), new aw.Graph.Point(lsTest3.p1[0],lsTest3.p1[1]));
		lsTest3.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_false(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(false) Primary");
	var lsTest5 = {
		p0: [-1,-1],
		p1: [0,0],
		contains: [[1,1], [0.5,0.5], [0,0.5], [1,0], [0,1]]
	}
	test(function() {
		var ls = new aw.Graph.LineSegment(new aw.Graph.Point(lsTest5.p0[0],lsTest3.p0[1]), new aw.Graph.Point(lsTest5.p1[0],lsTest5.p1[1]));
		lsTest5.contains.forEach(function(pointArray){
			var point = new aw.Graph.Point(pointArray[0], pointArray[1]);
			assert_false(ls.containsPoint(point));
		});
	}, "LineSegment.containsPoint(false) Secondary");
/*	// <= reverse it , [-1,-1]
	1,1 0 contains 0,0 0.5,0.5 1.0,1.0 -1,-1
	0 1,1 intersects 0,1 1,0 -1,1 1,-1 0.5,0.5 to 1.5,1.5  -1,-1 to -0.5,-0.5
	1,1 0 intersects reverse all
	parallel*/
	/*Rectangle
	Polygon
	polygon = new aw.Graph.Polygon([new aw.Graph.Point(-1, -1), new aw.Graph.Point(-1, 1), new aw.Graph.Point(0, 1), new aw.Graph.Point(0, 0), new aw.Graph.Point(1, 0), new aw.Graph.Point(1, -1)]);
	Ellipse*/

/* Haven't dug through my GitHub pages yet?  Check out .  Who knows what treasures you might find. */