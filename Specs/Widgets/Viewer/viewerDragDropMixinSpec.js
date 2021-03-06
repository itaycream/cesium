/*global defineSuite*/
defineSuite([
         'Widgets/Viewer/viewerDragDropMixin',
         'Core/defined',
         'Core/TimeInterval',
         'Specs/EventHelper',
         'Widgets/Viewer/Viewer'
     ], function(
         viewerDragDropMixin,
         defined,
         TimeInterval,
         EventHelper,
         Viewer) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var container;
    var viewer;
    beforeEach(function() {
        container = document.createElement('div');
        container.id = 'container';
        container.style.display = 'none';
        document.body.appendChild(container);

        //Impersonate FileReader for drag and drop tests
        var fakeFileReader = jasmine.createSpyObj('FileReader', ['readAsText']);
        fakeFileReader.readAsText = function(file) {
            if (defined(file.czmlString)) {
                this.onload({
                    target : {
                        result : file.czmlString
                    }
                });
            } else {
                this.onerror({
                    target : {
                        error : file.errorMessage
                    }
                });
            }
        };
        spyOn(window, 'FileReader').andReturn(fakeFileReader);
    });

    afterEach(function() {
        if (viewer && !viewer.isDestroyed()) {
            viewer = viewer.destroy();
        }

        document.body.removeChild(container);
    });

    it('mixin sets default values', function() {
        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin);
        expect(viewer.dropTarget).toBe(viewer.container);
        expect(viewer.dropEnabled).toEqual(true);
        expect(viewer.clearOnDrop).toEqual(true);
    });

    it('mixin sets option values', function() {
        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin, {
            dropTarget : document.body,
            clearOnDrop : false
        });
        expect(viewer.dropTarget).toBe(document.body);
        expect(viewer.dropEnabled).toEqual(true);
        expect(viewer.clearOnDrop).toEqual(false);
    });

    it('mixin works with dropTarget id string', function() {
        viewer = new Viewer(document.body);
        viewer.extend(viewerDragDropMixin, {
            dropTarget : 'container'
        });
        expect(viewer.dropTarget).toBe(container);
    });

    var czml1 = {
        id : 'test',
        availability : '2000-01-01/2001-01-01',
        billboard : {
            show : true
        }
    };

    var czml2 = {
        id : 'test2',
        availability : '2000-01-02/2001-01-02',
        billboard : {
            show : true
        }
    };

    it('handleDrop processes drop event', function() {
        var mockEvent = {
            dataTransfer : {
                files : [{
                    name : 'czml1.czml',
                    czmlString : JSON.stringify(czml1)
                }]
            },
            stopPropagation : function() {
            },
            preventDefault : function() {
            }
        };

        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin);

        EventHelper.fireMockEvent(viewer._handleDrop, mockEvent);

        waitsFor(function() {
            return viewer.dataSources.getLength() === 1;
        });

        runs(function() {
            var dataSource = viewer.dataSources.get(0);
            var interval = TimeInterval.fromIso8601(czml1.availability);
            expect(dataSource.getDynamicObjectCollection().getById('test')).toBeDefined();
            expect(dataSource.getClock().startTime).toEqual(interval.start);
            expect(dataSource.getClock().stopTime).toEqual(interval.stop);
        });
    });

    it('handleDrop processes drop event with multiple files', function() {
        var mockEvent = {
            dataTransfer : {
                files : [{
                    name : 'czml1.czml',
                    czmlString : JSON.stringify(czml1)
                }, {
                    name : 'czml2.czml',
                    czmlString : JSON.stringify(czml2)
                }]
            },
            stopPropagation : function() {
            },
            preventDefault : function() {
            }
        };

        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin);

        EventHelper.fireMockEvent(viewer._handleDrop, mockEvent);

        waitsFor(function() {
            return viewer.dataSources.getLength() === 2;
        });

        runs(function() {
            var source1 = viewer.dataSources.get(0);
            var source2 = viewer.dataSources.get(1);
            expect(source1.getDynamicObjectCollection().getById('test')).toBeDefined();
            expect(source2.getDynamicObjectCollection().getById('test2')).toBeDefined();
            //Interval of first file should be used.
            var interval = TimeInterval.fromIso8601(czml1.availability);
            expect(source1.getClock().startTime).toEqual(interval.start);
            expect(source1.getClock().stopTime).toEqual(interval.stop);
        });
    });

    it('handleDrop obeys clearOnDrop', function() {
        var mockEvent = {
            dataTransfer : {
                files : [{
                    name : 'czml1.czml',
                    czmlString : JSON.stringify(czml1)
                }, {
                    name : 'czml2.czml',
                    czmlString : JSON.stringify(czml2)
                }]
            },
            stopPropagation : function() {
            },
            preventDefault : function() {
            }
        };

        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin);

        EventHelper.fireMockEvent(viewer._handleDrop, mockEvent);

        waitsFor(function() {
            return viewer.dataSources.getLength() === 2;
        });

        runs(function() {
            var source1 = viewer.dataSources.get(0);
            var source2 = viewer.dataSources.get(1);
            expect(source1.getDynamicObjectCollection().getById('test')).toBeDefined();
            expect(source2.getDynamicObjectCollection().getById('test2')).toBeDefined();
            //Interval of first file should be used.
            var interval = TimeInterval.fromIso8601(czml1.availability);
            expect(source1.getClock().startTime).toEqual(interval.start);
            expect(source1.getClock().stopTime).toEqual(interval.stop);

            viewer.clearOnDrop = false;
            EventHelper.fireMockEvent(viewer._handleDrop, mockEvent);
        });

        waitsFor(function() {
            return viewer.dataSources.getLength() === 4;
        });

        runs(function() {
            var source1 = viewer.dataSources.get(0);
            var source2 = viewer.dataSources.get(1);
            var source3 = viewer.dataSources.get(2);
            var source4 = viewer.dataSources.get(3);

            expect(source1.getDynamicObjectCollection().getById('test')).toBeDefined();
            expect(source2.getDynamicObjectCollection().getById('test2')).toBeDefined();
            expect(source3.getDynamicObjectCollection().getById('test')).toBeDefined();
            expect(source4.getDynamicObjectCollection().getById('test2')).toBeDefined();

            viewer.clearOnDrop = true;
            EventHelper.fireMockEvent(viewer._handleDrop, mockEvent);
        });

        waitsFor(function() {
            return viewer.dataSources.getLength() === 2;
        });

        runs(function() {
            var source1 = viewer.dataSources.get(0);
            var source2 = viewer.dataSources.get(1);
            expect(source1.getDynamicObjectCollection().getById('test')).toBeDefined();
            expect(source2.getDynamicObjectCollection().getById('test2')).toBeDefined();
            //Interval of first file should be used.
            var interval = TimeInterval.fromIso8601(czml1.availability);
            expect(source1.getClock().startTime).toEqual(interval.start);
            expect(source1.getClock().stopTime).toEqual(interval.stop);
        });
    });

    it('dropError is raised on exception', function() {
        var mockEvent = {
            dataTransfer : {
                files : [{
                    name : 'czml1.czml',
                    czmlString : 'bad JSON'
                }]
            },
            stopPropagation : function() {
            },
            preventDefault : function() {
            }
        };

        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin);

        var spyListener = jasmine.createSpy('listener');

        viewer.dropError.addEventListener(spyListener);
        EventHelper.fireMockEvent(viewer._handleDrop, mockEvent);

        waitsFor(function() {
            return spyListener.wasCalled;
        });

        runs(function() {
            expect(spyListener).toHaveBeenCalledWith(viewer, 'czml1.czml', jasmine.any(SyntaxError));

            viewer.dropError.removeEventListener(spyListener);
        });
    });

    it('dropError is raised FileReader error', function() {
        var mockEvent = {
            dataTransfer : {
                files : [{
                    name : 'czml1.czml',
                    errorMessage : 'bad JSON'
                }]
            },
            stopPropagation : function() {
            },
            preventDefault : function() {
            }
        };

        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin);

        var spyListener = jasmine.createSpy('listener');

        viewer.dropError.addEventListener(spyListener);
        EventHelper.fireMockEvent(viewer._handleDrop, mockEvent);

        waitsFor(function() {
            return spyListener.wasCalled;
        });

        runs(function() {
            expect(spyListener).toHaveBeenCalledWith(viewer, mockEvent.dataTransfer.files[0].name, mockEvent.dataTransfer.files[0].errorMessage);

            viewer.dropError.removeEventListener(spyListener);
        });
    });

    var MockContainer = function() {
        var events = {};
        this.events = events;

        this.addEventListener = function(name, func, bubble) {
            events[name] = {
                func : func,
                bubble : bubble
            };
        };

        this.removeEventListener = function(name, func, bubble) {
            var subscribed = events[name];
            expect(subscribed.func).toBe(func);
            expect(subscribed.bubble).toEqual(bubble);
            delete events[name];
        };
    };

    it('enable/disable subscribes to provided dropTarget.', function() {
        var dropTarget = new MockContainer();

        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin, {
            dropTarget : dropTarget
        });

        expect(dropTarget.events.drop).toBeDefined();
        expect(dropTarget.events.dragenter).toBeDefined();
        expect(dropTarget.events.dragover).toBeDefined();
        expect(dropTarget.events.dragexit).toBeDefined();

        viewer.dropEnabled = false;
        expect(dropTarget.events.drop).toBeUndefined();
        expect(dropTarget.events.dragenter).toBeUndefined();
        expect(dropTarget.events.dragover).toBeUndefined();
        expect(dropTarget.events.dragexit).toBeUndefined();

        viewer.dropEnabled = true;
        expect(dropTarget.events.drop).toBeDefined();
        expect(dropTarget.events.dragenter).toBeDefined();
        expect(dropTarget.events.dragover).toBeDefined();
        expect(dropTarget.events.dragexit).toBeDefined();
    });

    it('can set new dropTarget.', function() {
        var dropTarget1 = new MockContainer();
        var dropTarget2 = new MockContainer();

        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin, {
            dropTarget : dropTarget1
        });

        expect(dropTarget1.events.drop).toBeDefined();
        expect(dropTarget1.events.dragenter).toBeDefined();
        expect(dropTarget1.events.dragover).toBeDefined();
        expect(dropTarget1.events.dragexit).toBeDefined();

        viewer.dropTarget = dropTarget2;
        expect(dropTarget1.events.drop).toBeUndefined();
        expect(dropTarget1.events.dragenter).toBeUndefined();
        expect(dropTarget1.events.dragover).toBeUndefined();
        expect(dropTarget1.events.dragexit).toBeUndefined();

        expect(dropTarget2.events.drop).toBeDefined();
        expect(dropTarget2.events.dragenter).toBeDefined();
        expect(dropTarget2.events.dragover).toBeDefined();
        expect(dropTarget2.events.dragexit).toBeDefined();
    });

    it('throws with undefined viewer', function() {
        expect(function() {
            viewerDragDropMixin(undefined);
        }).toThrowDeveloperError();
    });

    it('throws with non-existant string container', function() {
        viewer = new Viewer(container);
        expect(function() {
            viewer.extend(viewerDragDropMixin, {
                dropTarget : 'doesNotExist'
            });
        }).toThrowDeveloperError();
    });

    it('throws if dropTarget property already added by another mixin.', function() {
        viewer = new Viewer(container);
        viewer.dropTarget = true;
        expect(function() {
            viewer.extend(viewerDragDropMixin);
        }).toThrowDeveloperError();
    });

    it('throws if dropEnabled property already added by another mixin.', function() {
        viewer = new Viewer(container);
        viewer.dropEnabled = true;
        expect(function() {
            viewer.extend(viewerDragDropMixin);
        }).toThrowDeveloperError();
    });

    it('throws if dropError property already added by another mixin.', function() {
        viewer = new Viewer(container);
        viewer.dropError = true;
        expect(function() {
            viewer.extend(viewerDragDropMixin);
        }).toThrowDeveloperError();
    });

    it('throws if clearOnDrop property already added by another mixin.', function() {
        viewer = new Viewer(container);
        viewer.clearOnDrop = true;
        expect(function() {
            viewer.extend(viewerDragDropMixin);
        }).toThrowDeveloperError();
    });

    it('setting dropTarget to undefined throws exception', function() {
        viewer = new Viewer(container);
        viewer.extend(viewerDragDropMixin);
        expect(function() {
            viewer.dropTarget = undefined;
        }).toThrowDeveloperError();
    });
}, 'WebGL');