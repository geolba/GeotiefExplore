

// @property pointer: Boolean
// `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
export var pointer = !!(window.PointerEvent || msPointer);

export var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
        (window.DocumentTouch && document instanceof window.DocumentTouch));
        

// @property mobile: Boolean; `true` for all browsers running in a mobile device.
export var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');


function userAgentContains(str) {
	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
}

// @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
export var ie = 'ActiveXObject' in window;