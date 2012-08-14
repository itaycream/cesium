/*global defineSuite*/
defineSuite([
         'Core/PolygonPipeline',
         'Core/Cartesian2',
         'Core/Cartesian3',
         'Core/Cartographic',
         'Core/Ellipsoid',
         'Core/EllipsoidTangentPlane',
         'Core/WindingOrder'
     ], function(
         PolygonPipeline,
         Cartesian2,
         Cartesian3,
         Cartographic,
         Ellipsoid,
         EllipsoidTangentPlane,
         WindingOrder) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    it('cleanUp removes duplicate points', function() {
        var positions = PolygonPipeline.cleanUp([
                                                 new Cartesian3(1.0, 1.0, 1.0),
                                                 new Cartesian3(2.0, 2.0, 2.0),
                                                 new Cartesian3(2.0, 2.0, 2.0),
                                                 new Cartesian3(3.0, 3.0, 3.0)
                                                ]);

        expect(positions).toEqual([
                                        new Cartesian3(1.0, 1.0, 1.0),
                                        new Cartesian3(2.0, 2.0, 2.0),
                                        new Cartesian3(3.0, 3.0, 3.0)
                                       ]);
    });

    it('cleanUp removes duplicate first and last points', function() {
        var positions = PolygonPipeline.cleanUp([
                                                 new Cartesian3(1.0, 1.0, 1.0),
                                                 new Cartesian3(2.0, 2.0, 2.0),
                                                 new Cartesian3(3.0, 3.0, 3.0),
                                                 new Cartesian3(1.0, 1.0, 1.0)
                                                ]);

        expect(positions).toEqual([
                                        new Cartesian3(2.0, 2.0, 2.0),
                                        new Cartesian3(3.0, 3.0, 3.0),
                                        new Cartesian3(1.0, 1.0, 1.0)
                                       ]);
    });

    it('cleanUp throws without positions', function() {
        expect(function() {
            PolygonPipeline.cleanUp();
        }).toThrow();
    });

    it('cleanUp throws without three positions', function() {
        expect(function() {
            PolygonPipeline.cleanUp([Cartesian3.ZERO, Cartesian3.ZERO]);
        }).toThrow();
    });

    ///////////////////////////////////////////////////////////////////////

    it('EllipsoidTangentPlane projects a point', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var p = ellipsoid.cartographicToCartesian(Cartographic.ZERO);

        var tangentPlane = EllipsoidTangentPlane.create(ellipsoid, [p]);
        var projectedP = tangentPlane.projectPointsOntoPlane([p]);

        expect(projectedP.length).toEqual(1);
        expect(projectedP[0].equals(Cartesian2.ZERO)).toEqual(true);
    });

    it('EllipsoidTangentPlane throws without ellipsoid', function() {
        expect(function() {
            return EllipsoidTangentPlane.create();
        }).toThrow();
    });

    it('EllipsoidTangentPlane throws without positions', function() {
        var ellipsoid = Ellipsoid.WGS84;

        expect(function() {
            return EllipsoidTangentPlane.create(ellipsoid);
        }).toThrow();
    });

    it('projectPointsOntoPlane throws without positions', function() {
        var ellipsoid = Ellipsoid.WGS84;
        var p = ellipsoid.cartographicToCartesian(Cartographic.ZERO);
        var tangentPlane = EllipsoidTangentPlane.create(ellipsoid, [p]);

        expect(function() {
            return tangentPlane.projectPointsOntoPlane();
        }).toThrow();
    });

    ///////////////////////////////////////////////////////////////////////

    it('computeArea2D computes a positive area', function() {
        var area = PolygonPipeline.computeArea2D([
                                                  new Cartesian2(0.0, 0.0),
                                                  new Cartesian2(2.0, 0.0),
                                                  new Cartesian2(2.0, 1.0),
                                                  new Cartesian2(0.0, 1.0)
                                                 ]);

        expect(area).toEqual(2.0);
    });

    it('computeArea2D computes a negative area', function() {
        var area = PolygonPipeline.computeArea2D([
                                                  new Cartesian2(0.0, 0.0),
                                                  new Cartesian2(0.0, 2.0),
                                                  new Cartesian2(1.0, 2.0),
                                                  new Cartesian2(1.0, 0.0)
                                                 ]);

        expect(area).toEqual(-2.0);
    });

    it('computeArea2D throws without positions', function() {
        expect(function() {
            PolygonPipeline.computeArea2D();
        }).toThrow();
    });

    it('computeArea2D throws without three positions', function() {
        expect(function() {
            PolygonPipeline.computeArea2D([Cartesian3.ZERO, Cartesian3.ZERO]);
        }).toThrow();
    });

    ///////////////////////////////////////////////////////////////////////

    it('computeWindingOrder2D computes counter-clockwise', function() {
        var area = PolygonPipeline.computeWindingOrder2D([
                                                          new Cartesian2(0.0, 0.0),
                                                          new Cartesian2(2.0, 0.0),
                                                          new Cartesian2(2.0, 1.0),
                                                          new Cartesian2(0.0, 1.0)
                                                         ]);

        expect(area).toEqual(WindingOrder.COUNTER_CLOCKWISE);
    });

    it('computeWindingOrder2D computes clockwise', function() {
        var area = PolygonPipeline.computeWindingOrder2D([
                                                          new Cartesian2(0.0, 0.0),
                                                          new Cartesian2(0.0, 2.0),
                                                          new Cartesian2(1.0, 2.0),
                                                          new Cartesian2(1.0, 0.0)
                                                         ]);

        expect(area).toEqual(WindingOrder.CLOCKWISE);
    });

    it('computeWindingOrder2D throws without positions', function() {
        expect(function() {
            PolygonPipeline.computeWindingOrder2D();
        }).toThrow();
    });

    it('computeWindingOrder2D throws without three positions', function() {
        expect(function() {
            PolygonPipeline.computeWindingOrder2D([Cartesian3.ZERO, Cartesian3.ZERO]);
        }).toThrow();
    });

    ///////////////////////////////////////////////////////////////////////

    it('earClip2D triangulates a triangle', function() {
        var indices = PolygonPipeline.earClip2D([new Cartesian2(0.0, 0.0), new Cartesian2(1.0, 0.0), new Cartesian2(0.0, 1.0)]);

        expect(indices).toEqual([0, 1, 2]);
    });

    it('earClip2D triangulates a square', function() {
        var indices = PolygonPipeline.earClip2D([new Cartesian2(0.0, 0.0), new Cartesian2(1.0, 0.0), new Cartesian2(1.0, 1.0), new Cartesian2(0.0, 1.0)]);

        expect(indices).toEqual([0, 1, 2, 0, 2, 3]);
    });

    it('earClip2D triangulates simple concave', function() {
        var positions = [new Cartesian2(0.0, 0.0), new Cartesian2(2.0, 0.0), new Cartesian2(2.0, 2.0), new Cartesian2(1.0, 0.25), new Cartesian2(0.0, 2.0)];

        var indices = PolygonPipeline.earClip2D(positions);

        expect(indices).toEqual([1, 2, 3, 3, 4, 0, 0, 1, 3]);
    });

    it('earClip2D triangulates complex concave', function() {
        var positions = [new Cartesian2(0.0, 0.0), new Cartesian2(2.0, 0.0), new Cartesian2(2.0, 1.0), new Cartesian2(0.1, 1.5), new Cartesian2(2.0, 2.0), new Cartesian2(0.0, 2.0),
                new Cartesian2(0.0, 1.0), new Cartesian2(1.9, 0.5)];

        var indices = PolygonPipeline.earClip2D(positions);

        expect(indices).toEqual([3, 4, 5, 3, 5, 6, 3, 6, 7, 7, 0, 1, 7, 1, 2, 2, 3, 7]);
    });

    it('earClip2D throws without positions', function() {
        expect(function() {
            PolygonPipeline.earClip2D();
        }).toThrow();
    });

    it('earClip2D throws without three positions', function() {
        expect(function() {
            PolygonPipeline.earClip2D([Cartesian2.ZERO, Cartesian2.ZERO]);
        }).toThrow();
    });

    ///////////////////////////////////////////////////////////////////////

    it('computeSubdivision throws without positions', function() {
        expect(function() {
            PolygonPipeline.computeSubdivision();
        }).toThrow();
    });

    it('computeSubdivision throws without indices', function() {
        expect(function() {
            PolygonPipeline.computeSubdivision([]);
        }).toThrow();
    });

    it('computeSubdivision throws with less than 3 indices', function() {
        expect(function() {
            PolygonPipeline.computeSubdivision([], [1, 2]);
        }).toThrow();
    });

    it('computeSubdivision throws without a multiple of 3 indices', function() {
        expect(function() {
            PolygonPipeline.computeSubdivision([], [1, 2, 3, 4]);
        }).toThrow();
    });

    it('computeSubdivision throws with negative granularity', function() {
        expect(function() {
            PolygonPipeline.computeSubdivision([], [1, 2, 3], -1.0);
        }).toThrow();
    });

    it('computeSubdivision', function() {
        var positions = [
                         new Cartesian3(0.0, 0.0, 90.0),
                         new Cartesian3(0.0, 90.0, 0.0),
                         new Cartesian3(90.0, 0.0, 0.0)
                        ];
        var indices = [0, 1, 2];
        var subdivision = PolygonPipeline.computeSubdivision(positions, indices, 60.0);

        expect(subdivision.attributes.position.values[0]).toEqual(0.0);
        expect(subdivision.attributes.position.values[1]).toEqual(0.0);
        expect(subdivision.attributes.position.values[2]).toEqual(90.0);
        expect(subdivision.attributes.position.values[3]).toEqual(0.0);
        expect(subdivision.attributes.position.values[4]).toEqual(90.0);
        expect(subdivision.attributes.position.values[5]).toEqual(0.0);
        expect(subdivision.attributes.position.values[6]).toEqual(90.0);
        expect(subdivision.attributes.position.values[7]).toEqual(0.0);
        expect(subdivision.attributes.position.values[8]).toEqual(0.0);

        expect(subdivision.indexLists[0].values[0]).toEqual(0);
        expect(subdivision.indexLists[0].values[1]).toEqual(1);
        expect(subdivision.indexLists[0].values[2]).toEqual(2);
    });

    it('scaleToGeodeticHeight throws without ellipsoid', function() {
        expect(function() {
            PolygonPipeline.scaleToGeodeticHeight();
        }).toThrow();
    });

    it('eliminateHoles throws an exception without an outerRing', function() {
        expect(function() {
            PolygonPipeline.eliminateHoles();
        }).toThrow();
    });

    it('eliminateHoles throws an exception with an empty outerRing', function() {
        expect(function() {
            PolygonPipeline.eliminateHoles([]);
        }).toThrow();
    });

    it('eliminateHoles throws an exception without a second argument', function() {
        expect(function() {
            PolygonPipeline.eliminateHoles([new Cartesian3()]);
        }).toThrow();
    });

    it('eliminateHoles removes a hole from a polygon', function() {
        var outerRing = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-122.0, 37.0, 0.0),
            new Cartographic.fromDegrees(-121.9, 37.0, 0.0),
            new Cartographic.fromDegrees(-121.9, 37.1, 0.0),
            new Cartographic.fromDegrees(-122.0, 37.1, 0.0),
            new Cartographic.fromDegrees(-122.0, 37.0, 0.0)
        ]);

        var innerRing = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-121.96, 37.04, 0.0),
            new Cartographic.fromDegrees(-121.96, 37.01, 0.0),
            new Cartographic.fromDegrees(-121.99, 37.01, 0.0),
            new Cartographic.fromDegrees(-121.99, 37.04, 0.0)
        ]);

        var innerRings = [innerRing];
        var positions = PolygonPipeline.eliminateHoles(outerRing, innerRings);

        expect(positions[0].equals(outerRing[0])).toEqual(true);
        expect(positions[1].equals(outerRing[1])).toEqual(true);

        expect(positions[2].equals(innerRing[0])).toEqual(true);
        expect(positions[3].equals(innerRing[1])).toEqual(true);
        expect(positions[4].equals(innerRing[2])).toEqual(true);
        expect(positions[5].equals(innerRing[3])).toEqual(true);
        expect(positions[6].equals(innerRing[0])).toEqual(true);

        expect(positions[7].equals(outerRing[1])).toEqual(true);
        expect(positions[8].equals(outerRing[2])).toEqual(true);
        expect(positions[9].equals(outerRing[3])).toEqual(true);
        expect(positions[10].equals(outerRing[0])).toEqual(true);
    });

    it('eliminateHoles ensures proper winding order', function() {
        var outerRing = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-122.0, 37.0, 0.0),
            new Cartographic.fromDegrees(-121.9, 37.0, 0.0),
            new Cartographic.fromDegrees(-121.9, 37.1, 0.0),
            new Cartographic.fromDegrees(-122.0, 37.1, 0.0),
            new Cartographic.fromDegrees(-122.0, 37.0, 0.0)
        ]);

        var innerRing = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-121.96, 37.04, 0.0),
            new Cartographic.fromDegrees(-121.99, 37.04, 0.0),
            new Cartographic.fromDegrees(-121.99, 37.01, 0.0),
            new Cartographic.fromDegrees(-121.96, 37.01, 0.0)
        ]);

        var innerRings = [innerRing];
        var positions = PolygonPipeline.eliminateHoles(outerRing, innerRings);

        expect(positions[0].equals(outerRing[0])).toEqual(true);
        expect(positions[1].equals(outerRing[1])).toEqual(true);

        expect(positions[2].equals(innerRing[0])).toEqual(true);
        expect(positions[3].equals(innerRing[3])).toEqual(true);
        expect(positions[4].equals(innerRing[2])).toEqual(true);
        expect(positions[5].equals(innerRing[1])).toEqual(true);
        expect(positions[6].equals(innerRing[0])).toEqual(true);

        expect(positions[7].equals(outerRing[1])).toEqual(true);
        expect(positions[8].equals(outerRing[2])).toEqual(true);
        expect(positions[9].equals(outerRing[3])).toEqual(true);
        expect(positions[10].equals(outerRing[0])).toEqual(true);
    });

    it('eliminateHoles works with concave polygons', function() {
        var outerRing = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-122.0, 37.0),
            new Cartographic.fromDegrees(-121.96, 37.0),
            new Cartographic.fromDegrees(-121.92, 37.03),
            new Cartographic.fromDegrees(-121.92, 37.0),
            new Cartographic.fromDegrees(-121.9, 37.0),
            new Cartographic.fromDegrees(-121.9, 37.1),
            new Cartographic.fromDegrees(-122.0, 37.1)
        ]);

        var innerRing = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-121.99, 37.01),
            new Cartographic.fromDegrees(-121.99, 37.04),
            new Cartographic.fromDegrees(-121.96, 37.04),
            new Cartographic.fromDegrees(-121.96, 37.01)
        ]);

        var positions = PolygonPipeline.eliminateHoles(outerRing, [innerRing]);

        expect(positions[0].equals(outerRing[0])).toEqual(true);
        expect(positions[1].equals(outerRing[1])).toEqual(true);
        expect(positions[2].equals(outerRing[2])).toEqual(true);

        expect(positions[3].equals(innerRing[2])).toEqual(true);
        expect(positions[4].equals(innerRing[3])).toEqual(true);
        expect(positions[5].equals(innerRing[0])).toEqual(true);
        expect(positions[6].equals(innerRing[1])).toEqual(true);
        expect(positions[7].equals(innerRing[2])).toEqual(true);

        expect(positions[8].equals(outerRing[2])).toEqual(true);
        expect(positions[9].equals(outerRing[3])).toEqual(true);
        expect(positions[10].equals(outerRing[4])).toEqual(true);
        expect(positions[11].equals(outerRing[5])).toEqual(true);
        expect(positions[12].equals(outerRing[6])).toEqual(true);
    });

    it('eliminateHoles eliminates multiple holes', function() {
        var outerRing = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-122.0, 37.0),
            new Cartographic.fromDegrees(-121.9, 37.0),
            new Cartographic.fromDegrees(-121.9, 37.1),
            new Cartographic.fromDegrees(-122.0, 37.1)
        ]);

        var inner0 = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-121.99, 37.01),
            new Cartographic.fromDegrees(-121.99, 37.04),
            new Cartographic.fromDegrees(-121.96, 37.04),
            new Cartographic.fromDegrees(-121.96, 37.01)
        ]);
        var inner1 = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-121.94, 37.06),
            new Cartographic.fromDegrees(-121.94, 37.09),
            new Cartographic.fromDegrees(-121.91, 37.09),
            new Cartographic.fromDegrees(-121.91, 37.06)
        ]);
        var inner2 = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-121.99, 37.06),
            new Cartographic.fromDegrees(-121.99, 37.09),
            new Cartographic.fromDegrees(-121.96, 37.09),
            new Cartographic.fromDegrees(-121.96, 37.06)
        ]);
        var inner3 = Ellipsoid.WGS84.cartographicArrayToCartesianArray([
            new Cartographic.fromDegrees(-121.94, 37.01),
            new Cartographic.fromDegrees(-121.94, 37.04),
            new Cartographic.fromDegrees(-121.91, 37.04),
            new Cartographic.fromDegrees(-121.91, 37.01)
        ]);

        var innerRings = [inner0, inner1, inner2, inner3];
        var positions = PolygonPipeline.eliminateHoles(outerRing, innerRings);
        expect(outerRing.length).toEqual(4);
        expect(innerRings.length).toEqual(4);
        expect(positions.length).toEqual(28);
    });
});