import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Raycaster } from 'three/src/core/Raycaster';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';
import { Mesh } from 'three/src/objects/Mesh';
import * as material from '../clip/material';
import * as domEvent from '../core/domEvent';
import * as browser from '../core/browser';

export class Picking {

    simulation;
    intersected;
    mouse;
    ray;
    normals;
    plane;
    touchCapable = false;
    isDraging = false;
    enabled = true;
    defaultMapCursor;

    constructor(size, center, simulation) {
        this.size = size;
        this.center = center;

        if (browser.touch && browser.mobile) {
            this.touchCapable = true;
        }

        this.simulation = simulation;
        this.intersected = null;
        this.mouse = new Vector2();
        this.ray = new Raycaster();
        this.normals = {
            x1: new Vector3(-1, 0, 0),
            x2: new Vector3(1, 0, 0),
            y1: new Vector3(0, -1, 0),
            y2: new Vector3(0, 1, 0),
            z1: new Vector3(0, 0, -1),
            z2: new Vector3(0, 0, 1)
        };
        let planeGeometry = new PlaneGeometry(this.size, this.size, 4, 4);
        this.plane = new Mesh(planeGeometry, material.Invisible);
        simulation.scene.add(this.plane);

        this.domElement = simulation.renderer.domElement;
        this.defaultMapCursor = this.domElement.style.cursor;
        domEvent.on(this.domElement, 'mousemove', this.mouseMove, this);
        if (this.touchCapable == true) {
            domEvent.on(this.domElement, 'touchstart', this.beginDrag, this);
        } else {
            domEvent.on(this.domElement, 'mousedown', this.beginDrag, this);
        }
    }

    _getOffset(element) {
        if (!element.getClientRects().length) {
            return { top: 0, left: 0 };
        }

        let rect = element.getBoundingClientRect();
        let win = element.ownerDocument.defaultView;
        return (
            {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            });
    }

    _getCanvasPoint(event) {
        let canvasOffset = this._getOffset(this.simulation.renderer.domElement);
        let eventX = (event.clientX !== undefined) ? event.clientX : (event.touches && event.touches[0].clientX);
        let eventY = (event.clientY !== undefined) ? event.clientY : (event.touches && event.touches[0].clientY);
        let xClickedOnCanvas = eventX - canvasOffset.left;
        let yClickedonCanvas = eventY - canvasOffset.top;
        return {
            x: xClickedOnCanvas,
            y: yClickedonCanvas
        }
    }

    mouseMove(event) {
        if (this.isDraging == true || this.simulation.selection.visible == false || this.enabled == false) {
            return;
        }
        let point = this._getCanvasPoint(event);
        let width = this.simulation.renderer.domElement.clientWidth;
        let height = this.simulation.renderer.domElement.clientHeight;
        let x = (point.x / width) * 2 - 1;
        let y = -(point.y / height) * 2 + 1;
        this.mouse.set(x, y);

        this.ray.setFromCamera(this.mouse, this.simulation.camera);
        let intersects = this.ray.intersectObjects(this.simulation.selection.selectables);

        if (intersects.length > 0) {
            let candidate = intersects[0].object;

            if (this.intersected !== candidate) {
                if (this.intersected !== null) {
                    this.intersected.guardian.rayOut();
                }
                // select yellow color
                candidate.guardian.rayOver();
                this.intersected = candidate;
                this.simulation.renderer.domElement.style.cursor = 'pointer';
                // this.simulation.throttledRender();
                this.simulation.deferringThrottle();
            }

        } else if (this.intersected !== null) {
            // cursor is not selecting the box
            this.intersected.guardian.rayOut();
            this.intersected = null;
            this.simulation.renderer.domElement.style.cursor = this.defaultMapCursor;
            // this.simulation.throttledRender();
            this.simulation.deferringThrottle();
        }
    }

    beginDrag(event) {
        if (this.simulation.selection.visible == false && this.enabled == false) {
            return;
        }
        // exit drag method, if not left mouse button was clicked
        if (this.touchCapable == false && event.which != 1) {
            return;
        }
        // this.mouse.setToNormalizedDeviceCoordinates(event, window);
        let point = this._getCanvasPoint(event);
        let width = this.simulation.renderer.domElement.clientWidth;
        let height = this.simulation.renderer.domElement.clientHeight;
        let x = (point.x / width) * 2 - 1;
        let y = -(point.y / height) * 2 + 1;
        this.mouse.set(x, y);

        this.ray.setFromCamera(this.mouse, this.simulation.camera);
        let intersects = this.ray.intersectObjects(this.simulation.selection.selectables);

        if (intersects.length > 0) {
            this.isDraging = true;
            event.preventDefault();
            event.stopPropagation();
            this.simulation.map.enabled = false;
            var intersectionPoint = intersects[0].point;
            var axis = intersects[0].object.axis;

            if (axis === 'x1' || axis === 'x2') {
                // intersectionPoint.setX(0);
                intersectionPoint.setX(this.center.x);
            } else if (axis === 'y1' || axis === 'y2') {
                // intersectionPoint.setY(0);
                intersectionPoint.setY(this.center.y);
            } else if (axis === 'z1' || axis === 'z2') {
                // intersectionPoint.setZ(0);
                intersectionPoint.setZ(this.center.z);
            }
            this.plane.position.copy(intersectionPoint);

            let newNormal = this.simulation.camera.position.clone().sub(
                this.simulation.camera.position.clone().projectOnVector(this.normals[axis])
            );
            this.plane.lookAt(newNormal.add(intersectionPoint));
            this.simulation.renderer.domElement.style.cursor = 'grab';
            // simulation.throttledRender();
            this.simulation.deferringThrottle();

            let continueDrag = function (event) {
                event.preventDefault();
                event.stopPropagation();
                // this.mouse.setToNormalizedDeviceCoordinates(event, window);
                let point = this._getCanvasPoint(event);
                let width = this.simulation.renderer.domElement.clientWidth;
                let height = this.simulation.renderer.domElement.clientHeight;
                let x = (point.x / width) * 2 - 1;
                let y = -(point.y / height) * 2 + 1;
                this.mouse.set(x, y);

                this.ray.setFromCamera(this.mouse, this.simulation.camera);
                let intersects = this.ray.intersectObject(this.plane);
                if (intersects.length > 0) {
                    let value;
                    if (axis === 'x1' || axis === 'x2') {
                        value = intersects[0].point.x;
                    } else if (axis === 'y1' || axis === 'y2') {
                        value = intersects[0].point.y;
                    } else if (axis === 'z1' || axis === 'z2') {
                        value = intersects[0].point.z;
                    }
                    this.simulation.selection.setValue(axis, value);
                    // this.simulation.selection.setValue('x1', 4452960);
                    // this.simulation.throttledRender();
                    this.simulation.deferringThrottle();
                }

            };

            let endDrag = function (event) {
                event.preventDefault();
                event.stopPropagation();
                this.isDraging = false;
                this.simulation.map.enabled = true;
                this.simulation.renderer.domElement.style.cursor = 'pointer';

                if (this.touchCapable == true) {
                    domEvent.off(this.domElement, 'touchmove', continueDrag, this);
                    domEvent.off(this.domElement, 'touchend', endDrag, this);
                    domEvent.off(this.domElement, 'touchcancel', endDrag, this);
                    domEvent.off(this.domElement, 'touchleave', endDrag, this);
                } else {
                    domEvent.off(this.domElement, 'mousemove', continueDrag, this);
                    domEvent.off(this.domElement, 'mouseup', endDrag, this);
                    domEvent.off(this.domElement, 'mouseleave', endDrag, this);
                }
            };

            if (this.touchCapable == true) {
                domEvent.on(this.domElement, 'touchmove', continueDrag, this);
                domEvent.on(this.domElement, 'touchend', endDrag, this);
                domEvent.on(this.domElement, 'touchcancel', endDrag, this);
                domEvent.on(this.domElement, 'touchleave', endDrag, this);
            } else {
                domEvent.on(this.domElement, 'mousemove', continueDrag, this);
                domEvent.on(this.domElement, 'mouseup', endDrag, this);
                domEvent.on(this.domElement, 'mouseleave', endDrag, this);
            }
        }
    }

    disable () {
        domEvent.off(this.domElement, 'mousemove', this.mouseMove, this);
        if (this.touchCapable == true) {
            domEvent.off(this.domElement, 'touchstart', this.beginDrag, this);
        } else {
            domEvent.off(this.domElement, 'mousedown', this.beginDrag, this);
        }
        this.enabled = false;
    }

    enable() {
        domEvent.on(this.domElement, 'mousemove', this.mouseMove, this);
        if (this.touchCapable == true) {
            domEvent.on(this.domElement, 'touchstart', this.beginDrag, this);
        } else {
            domEvent.on(this.domElement, 'mousedown', this.beginDrag, this);
        }
        this.enabled = true;
    }


}