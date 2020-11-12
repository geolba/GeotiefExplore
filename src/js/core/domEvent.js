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

export function removeListener(obj, type, fn) {  // (HTMLElement, String, Function)

    var id = stampForFn(fn);
    var key = '_gba_' + type + id;
    var handler = obj[key];

    if (!handler) { return this; }

    //if (L.Browser.pointer && type.indexOf('touch') === 0) {
    //    this.removePointerListener(obj, type, id);
    //} else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
    //    this.removeDoubleTapListener(obj, id);

    //} else if ('removeEventListener' in obj) {
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

export function preventDefault(e) {

    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    return this;
}

var skipEvents = {};

export function skipped(e) {
    var skipped = skipEvents[e.type];
    // reset when checking, as it's only used in map container and propagates outside of the map
    skipEvents[e.type] = false;
    return skipped;
}