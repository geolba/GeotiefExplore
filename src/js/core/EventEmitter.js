import * as util from './utilities';

 var eventsKey = '_events';

class EventEmitter {
    constructor() {
        var test = "test";
    }

    _getEvents() {
        return this._events || (this._events = {});
    }

    getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    }

    getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    }

    addListener(evt, fn, context) { // (String, Function[, Object]) or (Object[, Object])

        // types can be a map of types/handlers
        //if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) { return this; }

        //var events = this.getListenersAsObject(evt);
        var events = this[eventsKey] = this[eventsKey] || {};
        var contextId = context && context !== this && util.stamp(context);
        var i, len, event, type, indexKey, indexLenKey, typeIndex;

        //// types can be a string of space-separated words
        //types = util.splitWords(types);

        //for (i = 0, len = types.length; i < len; i++) {
        event = {
            action: fn,
            context: context || this
        };
        type = evt;// types[i];

        if (contextId) {
            // store listeners of a particular context in a separate hash (if it has an id)
            // gives a major performance boost when removing thousands of map layers

            indexKey = type + '_idx';
            indexLenKey = indexKey + '_len';

            typeIndex = events[indexKey] = events[indexKey] || {};

            if (!typeIndex[contextId]) {
                typeIndex[contextId] = [];

                // keep track of the number of keys in the index to quickly check if it's empty
                events[indexLenKey] = (events[indexLenKey] || 0) + 1;
            }

            typeIndex[contextId].push(event);


        }
        else {
            events[type] = events[type] || [];
            events[type].push(event);
        }
        //}

        return this;
    }

    removeListener(evt, fn, context) { // ([String, Function, Object]) or (Object[, Object])

        if (!this[eventsKey]) {
            return this;
        }

        //if (!types) {
        //    return this.clearAllEventListeners();
        //}

        //if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) { return this; }

        var events = this[eventsKey],
            contextId = context && context !== this && util.stamp(context),
            i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

        //types = L.Util.splitWords(types);

        //for (i = 0, len = types.length; i < len; i++) {
        type = evt;//types[i];
        indexKey = type + '_idx';
        indexLenKey = indexKey + '_len';

        typeIndex = events[indexKey];

        if (!fn) {
            // clear all listeners for a type if function isn't specified
            delete events[type];
            delete events[indexKey];
            delete events[indexLenKey];

        }
        else {
            listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

            if (listeners) {
                for (j = listeners.length - 1; j >= 0; j--) {
                    if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
                        removed = listeners.splice(j, 1);
                        // set the old action to a no-op, because it is possible
                        // that the listener is being iterated over as part of a dispatch
                        //removed[0].action = util.falseFn;
                    }
                }

                if (context && typeIndex && (listeners.length === 0)) {
                    delete typeIndex[contextId];
                    events[indexLenKey]--;
                }
            }
        }
        return this;
    }
    hasEventListeners(type) { // (String) -> Boolean
        var events = this[eventsKey];
        return !!events && ((type in events && events[type].length > 0) ||
            (type + '_idx' in events && events[type + '_idx_len'] > 0));
    }

    // (String[, Object])
    emit(type, data) {
        if (!this.hasEventListeners(type)) {
            return this;
        }

        var event = util.extend({}, data, { type: type, target: this });

        var events = this[eventsKey],
            listeners, i, len, typeIndex, contextId;

        if (events[type]) {
            // make sure adding/removing listeners inside other listeners won't cause infinite loop
            listeners = events[type].slice();

            for (i = 0, len = listeners.length; i < len; i++) {
                listeners[i].action.call(listeners[i].context, event);
            }
        }

        // fire event for the context-indexed listeners as well
        typeIndex = events[type + '_idx'];

        for (contextId in typeIndex) {
            listeners = typeIndex[contextId].slice();

            if (listeners) {
                for (i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].action.call(listeners[i].context, event);
                }
            }
        }

        return this;
    }




}

// aliases; we should ditch those eventually

// @method on(…): this
// Alias to [`on(…)`](#evented-on)
EventEmitter.on = EventEmitter.addListener;

// @method off(…): this
EventEmitter.off = EventEmitter.removeListener;

export { EventEmitter };