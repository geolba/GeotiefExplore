import * as util from './utilities';
/*
 * @namespace DomUtil
 *
 * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
 * tree, used by Leaflet internally.
 *
 * Most functions expecting or returning a `HTMLElement` also work for
 * SVG elements. The only difference is that classes refer to CSS classes
 * in HTML and SVG classes in SVG.
 */

// @function get(id: String|HTMLElement): HTMLElement
// Returns an element given its DOM id, or returns the element itself
// if it was passed directly.
export function byId(id, doc) {
    // inline'd type check.
    // be sure to return null per documentation, to match IE branch.
    return ((typeof id == "string") ? (doc || document).getElementById(id) : id) || null; // DOMNode
}

// @function empty(el: HTMLElement)
// Removes all of `el`'s children elements from `el`
export function empty(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}


export function createDom(tagName, opt_attributes, parent_node) {
    return _createDom(document, arguments);
}

function _createDom(doc, args) {
    var tagName = args[0];
    var attributes = args[1];
    //var var_args =  args[2];

    var element = doc.createElement(tagName);
    //var element = $(tagName);

    if (attributes) {
        if (typeof attributes === "string") {
            element.className = attributes;
        }
        //else if ($.isArray(attributes)) {
        //    //goog.dom.classes.add.apply(null, [element].concat(attributes));
        //}
        else {
            setProperties(element, attributes);
        }
    }

    if (args.length > 2) {
        var parent_node = args[2];
        parent_node.appendChild(element);
        //parent_node.insertBefore(element, parent_node.firstChild)
    }

    return element;
}

export function setProperties(element, properties) {
    //goog.object.forEach(properties, function(val, key) {
    // $.each(properties, function (key, val) {   
    for (let key in properties) {
        //     object.update();
        // });
        let val = properties[key];
        if (key === 'style') {
            element.style.cssText = val;
        }
        else if (key === 'class') {
            element.className = val;
        }
        else if (key === 'for') {
            element.htmlFor = val;
        }
        else if (key in ATTRIBUTE_MAP) {
            element.setAttribute(ATTRIBUTE_MAP[key], val);
        }
        else {
            element[key] = val;
        }
    }
}

// @function addClass(el: HTMLElement, name: String)
// Adds `name` to the element's class attribute.
export function addClass(el, name) {
	if (el.classList !== undefined) {
		var classes = util.trim(name).split(/\s+/);
		for (var i = 0, len = classes.length; i < len; i++) {
			el.classList.add(classes[i]);
		}
	} else if (!hasClass(el, name)) {
		var className = getClass(el);
		setClass(el, (className ? className + ' ' : '') + name);
	}
}


// @function setClass(el: HTMLElement, name: String)
// Sets the element's class.
export function setClass(el, name) {
	if (el.className.baseVal === undefined) {
		el.className = name;
	} else {
		// in case of SVG element
		el.className.baseVal = name;
	}
}

// @function getClass(el: HTMLElement): String
// Returns the element's class.
export function getClass(el) {
	// Check if the element is an SVGElementInstance and use the correspondingElement instead
	// (Required for linked SVG elements in IE11.)
	if (el.correspondingElement) {
		el = el.correspondingElement;
	}
	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
}

let ATTRIBUTE_MAP = {
    'cellpadding': 'cellPadding',
    'cellspacing': 'cellSpacing',
    'colspan': 'colSpan',
    'frameborder': 'frameBorder',
    'height': 'height',
    'maxlength': 'maxLength',
    'role': 'role',
    'rowspan': 'rowSpan',
    'type': 'type',
    'usemap': 'useMap',
    'valign': 'vAlign',
    'width': 'width'
};