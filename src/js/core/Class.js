import * as util from './utilities';

export function Class() { }

// @function extend(props: Object): Function
// [Extends the current class](#class-inheritance) given the properties to be included.
Class.extend = function (props) {

    var NewClass = function () {

        // call the constructor
        if (this.init) {
            this.init.apply(this, arguments);
        }

        //// call all constructor hooks
        //if (this._initHooks) {
        //    this.callInitHooks();
        //}
    };

    // instantiate class without calling constructor
    var F = function () { };
    F.prototype = this.prototype;

    var proto = new F();
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix given properties into the prototype
    util.extend(proto, props);
  
    return NewClass;
};

// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
Class.include = function (props) {
    util.extend(this.prototype, props);
    return this;
};