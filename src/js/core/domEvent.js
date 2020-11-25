import * as browser from '../core/browser';
import * as util from '../core/utilities';

 //static function
 var stampForFn = (function () {
    var lastId = 0,
        key = '_id';
    return function (obj) {
        obj[key] = obj[key] || ++lastId;
        return obj[key];
    };
}());

export function addListener(obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

    var id = stampForFn(fn);
    var key = '_gba_' + type + id;
    var handler, originalHandler, newType;

    if (obj[key]) { return this; }

    handler = function (e) {
        return fn.call(context || obj, e || domEvent._getEvent());
    };

    //if (L.Browser.pointer && type.indexOf('touch') === 0) {
    //    return this.addPointerListener(obj, type, handler, id);
    //}
    //if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
    //    this.addDoubleTapListener(obj, handler, id);
    //}

    if ('addEventListener' in obj) {

        if (type === 'mousewheel') {
            obj.addEventListener('DOMMouseScroll', handler, false);
            obj.addEventListener(type, handler, false);

        }
        else if ((type === 'mouseenter') || (type === 'mouseleave')) {

            originalHandler = handler;
            newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

            handler = function (e) {
                if (!_checkMouse(obj, e)) { return; }
                return originalHandler(e);
            };

            obj.addEventListener(newType, handler, false);

        }
        //else if (type === 'click' && L.Browser.android) {
        //    originalHandler = handler;
        //    handler = function (e) {
        //        return L.DomEvent._filterClick(e, originalHandler);
        //    };

        //    obj.addEventListener(type, handler, false);
        //}
        else {
            obj.addEventListener(type, handler, false);
        }

    }

    else if ('attachEvent' in obj) {
        obj.attachEvent('on' + type, handler);
    }

    obj[key] = handler;

    return this;
}

// @function on(…): this
// Alias to [`L.DomEvent.on`](#domevent-on)
export { addListener as on };


function addOne(obj, type, fn, context) {  


    var id = type + util.stamp(fn) + (context ? '_' + util.stamp(context) : '');
    var eventsKey = '_gba_' + type + id;

	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

	var handler = function (e) {
		return fn.call(context || obj, e || window.event);
	};

	var originalHandler = handler;

	if (browser.pointer && type.indexOf('touch') === 0) {
		// Needs DomEvent.Pointer.js
		addPointerListener(obj, type, handler, id);

	} else if (browser.touch && (type === 'dblclick') && !browserFiresNativeDblClick()) {
		addDoubleTapListener(obj, handler, id);

	} else if ('addEventListener' in obj) {

		if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' ||  type === 'mousewheel') {
			obj.addEventListener(mouseSubst[type] || type, handler, Browser.passiveEvents ? {passive: false} : false);

		} else if (type === 'mouseenter' || type === 'mouseleave') {
			handler = function (e) {
				e = e || window.event;
				if (isExternalTarget(obj, e)) {
					originalHandler(e);
				}
			};
			obj.addEventListener(mouseSubst[type], handler, false);

		} else {
			obj.addEventListener(type, originalHandler, false);
		}

	} else if ('attachEvent' in obj) {
		obj.attachEvent('on' + type, handler);
	}

	obj[eventsKey] = obj[eventsKey] || {};
	obj[eventsKey][id] = handler;
}

export function removeListener(obj, type, fn) {  // (HTMLElement, String, Function)

    var id = stampForFn(fn);
    var key = '_gba_' + type + id;
    var handler = obj[key];

    if (!handler) { return this; }
    
    if ('removeEventListener' in obj) {
        if (type === 'mousewheel') {
            obj.removeEventListener('DOMMouseScroll', handler, false);
            obj.removeEventListener(type, handler, false);

        } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
            obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
        } else {
            obj.removeEventListener(type, handler, false);
        }
    } else if ('detachEvent' in obj) {
        obj.detachEvent('on' + type, handler);
    }

    obj[key] = null;

    return this;
}

// @function removeListener(…): this
// Alias to [`L.DomEvent.off`](#domevent-off)
export { removeListener as off };

// check if element really left/entered the event target (for mouseenter/mouseleave)
function _checkMouse(el, e) {
    var related = e.relatedTarget;

    if (!related) { return true; }

    try {
        while (related && (related !== el)) {
            related = related.parentNode;
        }
    } catch (err) {
        return false;
    }
    return (related !== el);
}

export function stopPropagation(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
    skipped(e);
    return this;
}


// @function disableClickPropagation(el: HTMLElement): this
// Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
// `'mousedown'` and `'touchstart'` events (plus browser variants).
export function disableClickPropagation(el) {
	addListener(el, 'mousedown touchstart dblclick', stopPropagation);
	addOne(el, 'click', fakeStop);
	return this;
}

export function preventDefault(e) {

    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    return this;
}

var skipEvents = {};

export function fakeStop(e) {
	// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
	skipEvents[e.type] = true;
}
export function skipped(e) {
    var skipped = skipEvents[e.type];
    // reset when checking, as it's only used in map container and propagates outside of the map
    skipEvents[e.type] = false;
    return skipped;
}


// @function stop(ev: DOMEvent): this
// // Does `stopPropagation` and `preventDefault` at the same time.
// export function stop(e) {
// 	preventDefault(e);
// 	stopPropagation(e);
// 	return this;
// }