import * as dom from './domUtil';
/*
 * @namespace util
 *
 * Various utility functions, used by GeptiefExplore internally.
 */

const LOADING_ID_PREFIX = "loading_";

export function setLoading(elemID) {
	//debug("setting loading " + elemID);

	//// 1) create the jQuery Deferred object that will be used
	//var deferred = $.Deferred();
	//var ownerDocumentBody = document.getElementById(elemID);

	var loadingDivID = LOADING_ID_PREFIX + elemID;
	//var loadingDivID = "loading_" + elemID;
	var existingDiv = document.getElementById(loadingDivID);
	//var existingDiv = dom.byId(loadingDivID);


	// if the loading div for given element already exists,
	// increment the lock attribute value (or create the attribute,
	// if not exists)
	if (existingDiv != null) {
		//existingDiv.css("display", "inline");
		//dom.setProperties(existingDiv, {
		//    style: "display: block"
		//});
		if (typeof (existingDiv.attr("lock")) === "undefined") {
			existingDiv.attr("lock", 1);
		} else {
			existingDiv.attr("lock", parseInt(existingDiv.attr("lock")) + 1);
		}

	}
	// otherwise, create the div and append it to body
	else {
		// construct the div from markup
		//var loadingDiv = dom.createDom("div", { id: loadingDivID, "class": "loading" }, ownerDocumentBody);
		//var loadingDiv = $("<div id=\"" + loadingDivID + "\" class=\"loading\"></div>");
		var loadingDiv = document.createElement('div');
		loadingDiv.setAttribute("id", loadingDivID);
		loadingDiv.setAttribute("class", "loading");

		//var loadingDivContent = dom.createDom("div", { id: loadingDivID, innerHTML: myLabels.viewer.messages.waitMessage, "class": "loading-content" }, loadingDiv);
		// var loadingDivContent = $("<div class=\"loading-content\">" + myLabels.viewer.messages.waitMessage + "</div>");
		var loadingDivContent = document.createElement("div");
		loadingDivContent.innerHTML = "Hi there and greetings!";
		loadingDiv.appendChild(loadingDivContent);

		// get the element to be covered with the loading div...
		//var targetElement = $("#" + elemID);
		var targetElement = document.getElementById(elemID);

		// ... and get its proportions
		// var offset = targetElement.offset();
		var width = targetElement.offsetWidth
		var height = targetElement.offsetHeight;

		// make the div fit the target element
		// loadingDiv.css({
		// 	"left":  targetElement.offsetLeft + "px",
		// 	"top": targetElement.offsetTop + "px",
		// 	"width": width + "px",
		// 	"height": height + "px"
		// });
		//dom.setProperties(loadingDiv, {
		//    style: "width:" + width + "px;  height:" + height + "px;"// left:" + offset.left + "px; top:" + offset.top + "px"
		//});
		loadingDiv.style.left = targetElement.offsetLeft + "px";
		loadingDiv.style.top = targetElement.offsetTop + "px";
		loadingDiv.style.width = width + "px";
		loadingDiv.style.height = height + "px";


		// make the text appear in the middle of the loading div
		//dom.setProperties(loadingDivContent, {
		//    style: "line-height:" + height  + "px;"
		//});
		// loadingDivContent.css({
		// 	"line-height": height + "px"
		// });
		loadingDivContent.style.lineHeight = height + "px";


		// $("body").append(loadingDiv);
		//loadingDiv.appendTo('body');
		document.body.appendChild(loadingDiv);

		return loadingDiv;
	}
}

// @function extend(dest: Object, src?: Object): Object
// extend an object with properties of one or more other objects
export function extend(dest) {
	var i, j, len, src;

	for (j = 1, len = arguments.length; j < len; j++) {
		src = arguments[j];
		for (i in src) {
			dest[i] = src[i];
		}
	}
	return dest;
}

// @function create(proto: Object, properties?: Object): Object
// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
export var create = Object.create || (function () {
	function F() {}
	return function (proto) {
		F.prototype = proto;
		return new F();
	};
})()

export function showLoading () {
	var element = dom.byId("loadingImg");
	//domUtil.show(_loading);
	if (element) {
		element.style.display = "block";
	}
}

export function hideLoading () {
	var element = dom.byId("loadingImg");
	if (element) {
		element.style.display = "none";
	}
}

// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`
export function setOptions (obj, options) {
	if (!Object.prototype.hasOwnProperty.call(obj, 'options')) {
		obj.options = obj.options ? create(obj.options) : {};
	}
	for (var i in options) {
		obj.options[i] = options[i];
	}
	return obj.options;
}

// @property lastId: Number
// Last unique ID used by [`stamp()`](#util-stamp)
export var lastId = 0;

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assigning it one if it doesn't have it.
export function stamp (obj){
	let key = '_gba_id';
	obj[key] = obj[key] || ++lastId;
	return obj[key];

}

export function hasTouch () {
	var phantomjs = navigator.userAgent.toLowerCase().indexOf('phantom') !== -1;

	var isTouchDevice = phantomjs
		|| 'ontouchstart' in window
		|| (window.DocumentTouch && document instanceof window.DocumentTouch)
		|| ("onpointerdown" in document && navigator.maxTouchPoints > 0)
		|| window.navigator.msMaxTouchPoints;
	return isTouchDevice;
}
