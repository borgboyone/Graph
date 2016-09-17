/*!
 * Graph 2D Library 1.0.0
 * https://github.com/borgboyone/Graph
 *
 * Copyright 2016 Anthony Wells
 * Released under the MIT license.
 * https://raw.githubusercontent.com/borgboyone/Graph/master/LICENSE
 *
 * http://borgboyone.github.io/Graph/
 */

(function() {
"use strict";

var root = this;
root.aw = root.aw || {};
root.aw.Graph = root.aw.Graph || {};

root.aw.Graph.version = '1.0.0';

function _isComplex(vertices) {
	for (var i = 0; i < vertices.length - 2; i++) {
		for (var j = i + 2; j < vertices.length; j++) {
			if ((j + 1) % vertices.length == i) continue;
			var ls1 = new LineSegment(vertices[i], vertices[i+1]),
				ls2 = new LineSegment(vertices[j], vertices[(j+1) % vertices.length]);
			if (ls1.intersects(ls2)) return true;
		}
	}
	return false;
}

var Polygon = root.aw.Graph.Polygon =
	(function() {
		function Polygon(vertices) {
			if (!Array.isArray(vertices)) throw new Error("Parameter 1 (vertices) must be an array");
			vertices.forEach(function(vertex) {
				if (!Point.isInstance(vertex)) throw new Error("Parameter 1 (vertices) must be an array of Point");
			});
			if (vertices.length < 3) throw new Error("At least three vertices are required for a Polygon");
			if (_isComplex(vertices)) throw new Error("Complex polygons are not supported");
			this.vertices = vertices;
		}
		var objectProto = {
			// an iterator for the points would be nice
			isConvex: function() {
				if (this.vertices.length < 4) return true;
				var sign = false,
					d1 = new Point(0, 0),
					d2 = new Point(0, 0);

				// while, do/while might be better
				for (var i = 0; i < this.vertices.length; i++) {
					d1.x = this.vertices[(i + 2) % this.vertices.length].x - this.vertices[(i + 1) % this.vertices.length].x;
					d1.y = this.vertices[(i + 2) % this.vertices.length].y - this.vertices[(i + 1) % this.vertices.length].y;
					d2.x = this.vertices[i].x - this.vertices[(i + 1) % n].x;
					d2.y = this.vertices[i].y - this.vertices[(i + 1) % n].y;
					var crossProduct = d1.x * d2.y - d1.y * d2.x;
					// clean this up!
					if (i === 0) {
						sign = crossProduct > 0;
					} else if (sign !== (crossProduct > 0)) {
						return false;
					}
				}
				return true;
			},
			getCentroid: function() {
				var areaTotal = 0.0,
					areaPart = 0.0,
					centroidX = 0.0,
					centroidY = 0.0;

				for (var i = 0; i < this.vertices.length; i++) {
					var p0 = this.vertices[i],
						p1 = this.vertices[(i + 1) % this.vertices.length],
						areaPart = p0.x * p1.y - p0.y * p1.x;
					areaTotal += areaPart;
					centroidX += areaPart * (p0.x + p1.x);
					centroidY += areaPart * (p0.y + p1.y);
				}

				areaTotal *= 0.5;
				centroidX = centroidX / (6.0 * areaTotal);
				centroidY = centroidY / (6.0 * areaTotal);

				return new Point(centroidX, centroidY);
			},
			getBoundingRectangle: function() {
				var p0X = 0, p0Y = 0, p1X = 0, p1Y = 0;
				// = new Point(0, 0),
				//	p1 = new Point(0, 0);

				for (var i = 0; i < this.vertices.length; i++) {
					p0X = Math.min(p0X, this.vertices[i].x);
					p0Y = Math.min(p0Y, this.vertices[i].y);
					p1X = Math.max(p1X, this.vertices[i].x);
					p1Y = Math.max(p1Y, this.vertices[i].y);
				}

				return new Rectangle(p0X, p0Y, p1X - p0X, p1Y - p0Y);
			},
			//intersects: function(primitive => point, lineSegment, rectangle, polygon)
/*			containsPolygon: function(polygon) {
				// TODO: 
			},
			how about just contains?*/
			containsPoint: function(point) {
				var contains = false,
					rectangle = this.getBoundingRectangle();

				if (!rectangle.containsPoint(point)) return false;

				for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
					// check to see if point is contained to the side (should do this after the y check really)
					// so, it should be if point.y falls between inclusive of the y coordinates of the line segment
					//		if point lies on the segment return true
					//		if linesegment(point, new Point(rectangle.x + rectangle.width, point.y)).interesects(polygin.lineSegment) toggle
					if ((new LineSegment(this.vertices[i], this.vertices[j])).containsPoint(point)) return true;
					if (((this.vertices[i].y > point.y) !== (this.vertices[j].y > point.y)) &&
						(point.x < (this.vertices[j].x - this.vertices[i].x) * (point.y - this.vertices[i].y) / (this.vertices[j].y - this.vertices[i].y) + this.vertices[i].x) ) {
						contains = !contains;
					}
				}
				return contains;
			},
			intersects: function(lineSegment) {
				if (!LineSegment.isInstance(lineSegment)) throw new Error("Parameter 1 (lineSegment) of Polygon.intersects must of type LineSegment");

				var intersections = [];
				for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
					var intersection = lineSegment.intersects(new LineSegment(this.vertices[j], this.vertices[i]));
					if (intersection !== null) {
						intersections.push(intersection);
					}
				}
				return intersections;
			},
			constrain: function(point, center) {
				if (!Point.isInstance(point)) throw new Error("Parameter 1 (point) of Polygon.constrain must be of type Point");
				if ((typeof center !== 'undefined') && !Point.isInstance(center)) throw new Error("Parameter 2 (center) of Polygon.constrain must be of type Point");
				if ((typeof center !== 'undefined') && !this.containsPoint(center)) throw new Error("Polygon.constrain: Specified center must be contained in the Polygon");

				if (this.containsPoint(point)) return point;

				var center = typeof center === 'undefined' ? this.getCentroid() : center,
					lineSegment = new LineSegment(center, point);

				// migrate to intersects() => array[0]
				var intersection = this.intersects(lineSegment)[0];
				if (Point.isInstance(intersection)) return intersection;
				return Point.isInstance(intersection) ? intersection : (Point.distance(center, intersection.p0) > Point.distance(center, intersection.p1) ? intersection.p0 : intersection.p1);
				// maybe find a faster way that going through all the sides
/*				for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
					var intersection = lineSegment.intersects(new LineSegment(this.vertices[j], this.vertices[i]));
					if (intersection !== null) {
						if (Point.isInstance(intersection))
							return intersection;
						// it's a LineSegment, return farthest point
						return Point.distance(center, intersection.p0) > Point.distance(center, intersection.p1) ? intersection.p0 : intersection.p1;
					}
				}*/
			},
			clone: function() {
				// slice, make sure to clone the points as well
			}
			//rotate(degrees[, center])
			//scale(x, y[, center])
			//getBoundingCircle
		};

		Polygon.prototype = objectProto;
		Polygon.prototype.constructor = Polygon;
		Polygon.isInstance = function(polygon) {
			return typeof polygon == 'object' && polygon.constructor == Polygon;
		};

		return Polygon;
	})();

var Point = root.aw.Graph.Point =
	(function() {
		var Point = function(x, y) {
			if (!(this instanceof Point))
				throw new Error("Point called in static context; use new Point() instead");

			if (typeof x !== 'number') throw new Error("Parameter 1 (x) of Point.constructor must be of type number");
			if (typeof y !== 'number') throw new Error("Parameter 2 (y) of Point.constructor must be of type number");
			this.x = x;
			this.y = y;
			Object.freeze(this);
		}
		var objectProto = {
			equals: function(point) {
				if (!Point.isInstance(point)) throw new Error("Parameter 1 (point) of Point.equals must be of type Point");
				return this.x === point.x && this.y === point.y;
			},
			clone: function() {
				return new Point(this.x, this.y);
			}
		}

		Point.prototype = objectProto;
		Point.prototype.constructor = Point;
		Point.isInstance = function(point) {
			return typeof point == 'object' && point.constructor == Point;
		};
		Point.distance = function(p0, p1) {
			if (!Point.isInstance(p0)) throw new Error("Parameter 1 (p0) must be of type Point");
			if (!Point.isInstance(p1)) throw new Error("Parameter 2 (p1) must be of type Point");

			return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
		};

		return Point;
	})();

var Vector = root.aw.Graph.Vector =
	(function() {
		var Vector = function() {
			if (!(this instanceof Vector))
				throw new Error("Vector called in static context; use new Vector() instead");
			// allowable parameters: (point),(LineSegment), (point0, point1)
			if (arguments.length == 1) {
				var point = arguments[0];
				if (!(Point.isInstance(point) || LineSegment.isInstance(point))) throw new Error("Parameter 1 (point/lineSegment) must be of type Point or type LineSegment");
				if (Point.isInstance(point)) {
					this.i = point.x;
					this.j = point.y;
				} else {
					this.i = point.p1.x - point.p0.x;
					this.j = point.p1.y - point.p0.y;
				}
			} else if (arguments.length == 2) {
				var p0 = arguments[0], p1 = arguments[1];
				if (!Point.isInstance(p0)) throw new Error("Parameter 1 (p0) must be of type Point");
				if (!Point.isInstance(p1)) throw new Error("Parameter 2 (p1) must be of type Point");
				this.i = p1.x - p0.x;
				this.j = p1.y - p0.y;
			} else throw new Error("Unmatched number of parameters to Vector constructor");
		}
		var objectProto = {
			add: function(vector) {

			},
			subtract: function(vector) {

			},
			scale: function(factor) {

			},
			unit: function() {

			},
			equals: function(vector) {
				if (!Vector.isInstance(vector)) throw new Error("Parameter 1 (vector) must be of type Vector");
				return this.i === vector.i && this.j === vector.j;
			},
			clone: function() {
				return new Vector(this.i, this.j);
			}
		}
		Vector.prototype = objectProto;
		Vector.prototype.constructor = Vector;
		Vector.isInstance = function(vector) {
			return typeof vector == 'object' && vector.constructor == Vector;
		};
		Vector.crossProduct = function(vector1, vector2) {
			if (!Vector.isInstance(vector1)) throw new Error("Parameter 1 (vector1) must be of type Vector");
			if (!Vector.isInstance(vector2)) throw new Error("Parameter 2 (vector2) must be of type Vector");
			return vector1.i * vector2.j - vector1.j * vector2.i;
		};
/*		Vector.dotProduct = function(vector1, vector2) {
			if (!Vector.isInstance(vector1)) throw new Error("Parameter 1 (vector1) must be of type Vector");
			if (!Vector.isInstance(vector2)) throw new Error("Parameter 2 (vector2) must be of type Vector");
			return vector1.i * vector2.i + vector1.j * vector1.j;
		};*/

		return Vector;
	})();

var Rectangle = root.aw.Graph.Rectangle =
	(function() {
		var Rectangle = function(x, y, width, height) { // also accept p0, p1
			if (!(this instanceof Rectangle))
				throw new Error("Rectangle called in static context; use new Rectangle() instead");
			if (arguments.length == 2) {
				if (!Point.isInstance(x)) throw new Error("Parameter 1 (p0) of Rectangle.constructor must be of type Point");
				if (!Point.isInstance(y)) throw new Error("Parameter 2 (p1) of Rectangle.constructor must be of type Point");
				this.x = Math.min(x.x, y.x); this.y = Math.min(x.y, y.y);
				this.width = Math.max(x.x, y.x) - this.x;
				this.height = Math.max(x.y, y.y) - this.y;
			} else if (arguments.length == 4) {
				if (typeof x !== 'number') throw new Error("Parameter 1 (x) of Rectangle.constructor must be of type Number");
				if (typeof y !== 'number') throw new Error("Parameter 2 (y) of Rectangle.constructor must be of type Number");
				if (typeof width !== 'number') throw new Error("Parameter 3 (width) of Rectangle.constructor must be of type Number");
				if (typeof height !== 'number') throw new Error("Parameter 4 (height) of Rectangle.constructor must be of type Number");
				this.x = x;
				this.y = y;
				this.width = width;
				this.height = height;
			} else throw new Error("Unmatched number of parameters to Rectangle.constructor");
		}
		var objectProto = {
			containsPoint: function(point) {
				if (!Point.isInstance(point)) throw new Error("Parameter 1 (point) of Rectangle.containsPoint must be of type Point");
				return (this.x <= point.x) && (point.x <= this.x + this.width) && (this.y <= point.y) && (point.y <= this.y + this.height);
			},
			intersects: function(lineSegment) {
				if (!LineSegment.isInstance(lineSegment)) throw new Error("Parameter 1 (lineSegment) of Polygon.intersects must of type LineSegment");

				var intersections = [];
				for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
					var intersection = lineSegment.intersects(new LineSegment(this.vertices[j], this.vertices[i]));
					if (intersection !== null) {
						intersections.push(intersection);
					}
				}
				return intersections;
			},
			constrain: function(point, center) {
				if (!Point.isInstance(point)) throw new Error("Parameter 1 (point) of Rectangle.constrain must be of type Point");
				if ((typeof center !== 'undefined') && !Point.isInstance(center)) throw new Error("Parameter 2 (center) of Rectangle.constrain must be of type Point");
				if ((typeof center !== 'undefined') && !this.containsPoint(center)) throw new Error("Rectangle.constrain: Specified center must be contained in the Rectangle");

				if (this.containsPoint(point)) return point;

				var center = typeof center === 'undefined' ? new Point((this.x + this.width) / 2, (this.y + this.height) / 2) : center,
					lineSegment = new LineSegment(center, point);

				for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
					var intersection = lineSegment.intersects(new LineSegment(this.vertices[j], this.vertices[i]));
					if (intersection !== null) {
						if (Point.isInstance(intersection))
							return intersection;
						// it's a LineSegment, return farthest point
						return Point.distance(center, intersection.p0) > Point.distance(center, intersection.p1) ? intersection.p0 : intersection.p1;
					}
				}
			},
			clone: function() {
				return new Rectangle(this.x, this.y, this.width, this.height);
			}
			/*containsRectangle: function(rectangle) {
			}*/
		}

		Rectangle.prototype = objectProto;
		Rectangle.prototype.constructor = Rectangle;
		Rectangle.isInstance = function(rectangle) {
			return typeof rectangle == 'object' && rectangle.constructor == Rectangle;
		};

		return Rectangle;
	})();

var Ellipse = root.aw.Graph.Ellipse =
	(function() {
		var Ellipse = function(center, aRadius, bRadius) {
			if (!(this instanceof Ellipse))
				throw new Error("Ellipse called in static context; use new Ellipse() instead");

			if (!Point.isInstance(center)) throw new Error("Parameter 1 (center) of Ellipse.constructor must be of type Point");
			if (typeof aRadius !== 'number') throw new Error("Parameter 2 (aRadius) of Ellipse.constructor must be of type Number");
			if ((typeof bRadius !== 'undefined') && (typeof bRadius !== 'number')) throw new Error("Parameter 3 (bRadius) of Ellipse.constructor must be of type Number");

			// check for zero radius's
			this.center = center;
			this.aRadius = aRadius;
			this.bRadius = typeof bRadius === 'undefined' ? aRadius : bRadius;
		}
		var objectProto = {
			containsPoint: function(point) {
				if (!Point.isInstance(point)) throw new Error("Parameter 1 (point) of Ellipse.containsPoint must be of type Point");
				var x2 = Math.pow(point.x - this.center.x, 2),
					y2 = Math.pow(point.y - this.center.y, 2),
					a2 = Math.pow(this.aRadius, 2),
					b2 = Math.pow(this.bRadius, 2);

				return x2 / a2 + y2 / b2 <= 1;
			},
			intersects: function(lineSegment) {
				if (!LineSegment.isInstance(lineSegment)) throw new Error("Parameter 1 (lineSegment) of Ellipse.intersects must of type LineSegment");

				var a = Math.pow(lineSegment.p1.x - lineSegment.p0.x, 2) / Math.pow(this.aRadius, 2) + Math.pow(lineSegment.p1.y - lineSegment.p0.y, 2) / Math.pow(this.bRadius, 2),
					b = (2 * lineSegment.p0.x * (lineSegment.p1.x - lineSegment.p0.x)) / Math.pow(this.aRadius, 2) + (2 * lineSegment.p0.y * (lineSegment.p1.y - lineSegment.p0.y)) / Math.pow(this.bRadius, 2),
					c = Math.pow(lineSegment.p0.x / this.aRadius, 2) + Math.pow(lineSegment.p0.y / this.bRadius, 2) - 1,
					det = (Math.pow(b, 2) - 4 * a * c);

				if (det < 0) return null;
				if (det == 0) {
					var t0 = -b / (2*a);
					return ((t0 >= 1) || (t0 <= 0)) ? null :
						new Point((lineSegment.p1.x - lineSegment.p0.x) * t0 + lineSegment.p0.x, (lineSegment.p1.y - lineSegment.p0.y) * t0 + lineSegment.p0.y);
				}
				if (det > 0) {
					var t0 = (-b + Math.sqrt(det)) / (2*a);
					var t1 = (-b - Math.sqrt(det)) / (2*a);
					var points = [];
					if ((t0 >= 0) && (t0 <= 1))
						points.push(new Point((lineSegment.p1.x - lineSegment.p0.x) * t0 + lineSegment.p0.x, (lineSegment.p1.y - lineSegment.p0.y) * t0 + lineSegment.p0.y));
					if ((t1 >= 0)  && (t1 <= 1))
						points.push(new Point((lineSegment.p1.x - lineSegment.p0.x) * t1 + lineSegment.p0.x, (lineSegment.p1.y - lineSegment.p0.y) * t1 + lineSegment.p0.y));
					if (points.length == 0) return null;
					else if (points.length == 1) return points.pop();
					return points;
				}
			},
			constrain: function(point, center) {
				if (!Point.isInstance(point)) throw new Error("Parameter 1 (point) of Ellipse.constrain must be of type Point");
				if ((typeof center !== 'undefined') && !Point.isInstance(center)) throw new Error("Parameter 2 (center) of Ellipse.constrain must be of type Point");
				if ((typeof center !== 'undefined') && !this.containsPoint(center)) throw new Error("Ellipse.constrain: Specified center must be contained in the Ellipse");

				if (this.containsPoint(point)) return point;

				if (typeof center === 'undefined') {
					// shift point so that center is 0, 0
					var xc = point.x - this.center.x,
						yc = point.y - this.center.y,
						h = Math.sqrt(Math.pow(xc, 2) + Math.pow(yc, 2)),
						xe = this.aRadius * xc / h + this.center.x,
						ye = this.bRadius * yc / h + this.center.y;

					return new Point(xe, ye);
				}

				// use intersects
				return this.intersects(new LineSegment(center, point));
			},
			clone: function() {
				return new Ellipse(this.center.clone, this.aRadius, this.bRadius);
			}
		}

		Ellipse.prototype = objectProto;
		Ellipse.prototype.constructor = Ellipse;
		Ellipse.isInstance = function(ellipse) {
			return typeof ellipse === 'object' && ellipse.constructor == Ellipse;
		}

		return Ellipse;
	})();

var LineSegment = root.aw.Graph.LineSegment =
	(function() {
		function LineSegment(p0, p1) {
			this.p0 = p0;
			this.p1 = p1;
		}

		var objectProto = {
			containsPoint: function(point) {
				if (!Point.isInstance(point)) throw new Error("Parameter 1 (point) must be of type Point");

				var u = new Vector(this),
					v = new Vector(point),
					w = new Vector(point, this.p0);
					//d = Vector.crossProduct(u, v);

				//if (d !== 0) return false;
				if ((Vector.crossProduct(u, w) !== 0) || (Vector.crossProduct(v, w) !== 0)) return false;

				if (this.p0.x != this.p1.x) {
					if ((this.p0.x <= point.x && point.x <= this.p1.x) || (point.x <= this.p0.x && this.p1.x <= point.x)) return true;
				} else {
					if ((this.p0.y <= point.y && point.y <= this.p1.y) || (point.y <= this.p0.y && this.p1.y <= point.y)) return true;
				}
				return false;
			},
			intersects: function(lineSegment) {
				if (!(LineSegment.isInstance(lineSegment) || Point.isInstance(lineSegment))) throw new Error("Parameter 1 (point or lineSegment) must be of type Point or LineSegment");
				if (Point.isInstance(lineSegment)) lineSegment = new LineSegment(lineSegment, lineSegment);

				var u = new Vector(this),
					v = new Vector(lineSegment),
					w = new Vector(lineSegment.p0, this.p0),
					denominator = Vector.crossProduct(u, v),
					numerator = Vector.crossProduct(u, w);

				if (denominator == 0) {
					if (numerator != 0) // might need to do v, w as well check this || Vector.crossProduct(v, w) != 0
						return null; // parallel

					var d0 = this.p0.equals(this.p1),
					d1 = lineSegment.p0.equals(lineSegment.p1);
					if (d0 && d1) {
							if (this.p0.equals(lineSegment.p0))
								return lineSegment.p0; // same points
							else
								return null; // different points
					}
					if (d0) {
						if (lineSegment.containsPoint(this.p0)) {
							return this.p0;
						} else
							return null;
					}
					if (d1) {
						if (this.containsPoint(lineSegment.p0)) {
							return lineSegment.p0;
						} else
							return null;
					}

					// they are colinear
					var t0 = 0.0, t1 = 0.0, w2 = new Vector(lineSegment.p0, this.p1);
					if (v.i != 0) {
						t0 = w.i / v.i;
						t1 = w2.i / v.i;
					} else {
						t0 = w.j / v.j;
						t1 = w2.j / v.j;
					}
					if (t0 > t1) t1 = [t0, t0 = t1][0];
					// TODO: is clipping necessary? Can we normalize the vectors to prevent this?
					t0 = t0<0? 0 : t0;
					t1 = t1>1? 1 : t1;
 					if (t0 > 1 || t1 < 0) return null;
					if (t0 == t1) { // intersect is a point
						return new Point(lineSegment.p0.x + t0 * v.i, lineSegment.p0.y + t0 * v.j);
					}
					return new LineSegment(new Point(lineSegment.p0.x + t0 * v.i, lineSegment.p0.y + t0 * v.j), new Point(lineSegment.p0.x + t1 * v.i, lineSegment.p0.y + t1 * v.j))
				}

				var i = Vector.crossProduct(v, w) / denominator; //Vector.crossProduct(v, w) / denominator;
				//if (!Number.[in]range(i, 0, 1)) return null;
				if (!((i >= 0) && (i <= 1))) return null;
				var i2 = Vector.crossProduct(u, w) / denominator;
				if (!((i2 >= 0) && (i2 <= 1))) return null;//Number.range(i2, 0, 1)) return null;
				//this.p0 + i * u <= can we do some Vector.add, scale functions?
				// (new Vector(this.po).add(u.scale(i)).toPoint();X
				return new Point(this.p0.x + i * u.i, this.p0.y + i * u.j);
			}, /* intersects */
			clone: function() {
				return new LineSegment(this.p0.clone(), this.p1.clone());
			}
		}
		LineSegment.prototype = objectProto;
		LineSegment.prototype.constructor = LineSegment;
		LineSegment.isInstance = function(lineSegment) {
			return typeof lineSegment == 'object' && lineSegment.constructor == LineSegment;
		};

		return LineSegment;
	})();

}.call(this));
