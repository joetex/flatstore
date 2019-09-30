import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

var flatiron = {};  //main library
var fiStore = {};   //global store
var fiWatchers = {};    //component watchers
var fiIncrementIndex = 0; //HOC indexing
var fiSubscribers;  //global subscribers (outside components)
var fiHistoryIndex = {}; //index of history
var fiHistory = {}; //history list of copied states
var delimiter = "-";

flatiron.get = function (key) {
    let value = _getChild(fiStore, key);
    if (Array.isArray(value)) {
        return Object.assign([], value);
    }
    if (value instanceof Object) {
        return Object.assign({}, value);
    }
    return value;
}


flatiron.delimiter = function (d) {
    delimiter = d;
}

function _getChild(obj, path) {
    var i;
    path = path.split(delimiter);
    for (i = 0; i < path.length - 1; i++)
        obj = obj[path[i]];

    return obj[path[i]];
}

function _setChild(obj, path, value) {
    var i;
    path = path.split(delimiter);
    for (i = 0; i < path.length - 1; i++)
        obj = obj[path[i]];

    obj[path[i]] = value;
    return path.length;
}

flatiron.copy = function (key) {
    let value = flatiron.get(key);
    return cloneDeep(value);
}

flatiron.set = function (key, newValue) {
    let oldValue = fiStore[key];
    _setChild(fiStore, key, newValue);
    flatiron._notifyHistory(key, newValue);
    flatiron._notifyComponents(key, newValue);
    flatiron._notifySubscribers(key, newValue);
}

flatiron._setHistory = function (key, newValue) {
    let oldValue = fiStore[key];
    fiStore[key] = newValue;
    flatiron._notifyComponents(key, newValue);
    flatiron._notifySubscribers(key, newValue);
}

flatiron.subscribe = function (key, callback) {
    if (!(callback instanceof Function))
        throw new Error("[flatiron.subscribe] ERROR: callback must be a function.");
    if (!fiSubscribers)
        fiSubscribers = {};

    if (!fiSubscribers[key])
        fiSubscribers[key] = [];
    fiSubscribers[key].push(callback);
}

flatiron.undo = function (key) {
    if (!(key in fiHistory))
        throw new Error("[flatiron.undo] ERROR: Key does not have historical state");

    let index = fiHistoryIndex[key] - 1;
    if (index < 0)
        index = 0;
    fiHistoryIndex[key] = index;
    flatiron._setHistory(key, fiHistory[key][index]);
}

flatiron.redo = function (key) {
    if (!(key in fiHistory))
        throw new Error("[flatiron.redo] ERROR: Key does not have historical state");
    let index = fiHistoryIndex[key] + 1;
    if (index >= fiHistory[key].length)
        index = fiHistory[key].length - 1;
    fiHistoryIndex[key] = index;
    flatiron._setHistory(key, fiHistory[key][index]);
}

flatiron.historical = function (key) {
    fiHistory[key] = [];
    fiHistoryIndex[key] = 0;
}

flatiron.connect = function (watchedKeys, onCustomWatched, onCustomProps) {
    return function (WrappedComponent) {
        return class extends React.Component {
            constructor(props) {
                super(props);

                this.watched = {};
                this.onCustomWatched = null;
                this._flatironid = fiIncrementIndex++;

                if (onCustomWatched instanceof Function)
                    this.onCustomWatched = onCustomWatched;

                this.state = this.processWatched(true);
            }

            componentWillUnmount() {
                flatiron._unwatch(this.watched, this);
            }

            processWatched(isConstructor) {
                if (this.onCustomWatched)
                    watchedKeys = this.onCustomWatched({ ...this.props, ...this.state });

                if (!Array.isArray(watchedKeys))
                    throw new Error("[flatiron.ProcessWatched] ERROR: parameter watchList must return array of strings.");

                let componentState = {};

                for (let i in watchedKeys) {
                    let key = watchedKeys[i];

                    if (!(key in this.watched)) {
                        flatiron._watch(key, this);
                        this.watched[key] = true;
                        if (isConstructor) {
                            let customState = this.onNotify(key, flatiron.copy(key));
                            Object.assign(componentState, customState);
                        }
                    }
                }

                return componentState;
            }

            onNotify(key, value) {
                let componentState = {};
                componentState[key] = value;

                if (onCustomProps instanceof Function) {
                    let customComponentState = onCustomProps(key, Object.assign({}, fiStore), { ...this.props, ...this.state });
                    Object.assign(componentState, customComponentState);
                }

                if (this.onCustomWatched)
                    this.processWatched();

                this.setState(componentState);
                return componentState;
            }

            render() {
                return React.createElement(WrappedComponent, { ...this.state, ...this.props }, this.props.children);
            }
        };
    }
}

flatiron._notify = function (key, oldValue, newValue) {
    if (!key)
        return;

    flatiron._notifyHistory(key, newValue);
    flatiron._notifyComponents(key, newValue);
    flatiron._notifySubscribers(key, newValue);
}

flatiron._notifyHistory = function (key, value) {
    if (!(key in fiHistory))
        return;

    let index = fiHistoryIndex[key];
    if (index == fiHistory[key].length - 1)
        fiHistory[key].push(value);
    else
        fiHistory[key][index] = value;

    fiHistoryIndex[key]++;
}
flatiron._notifyComponents = function (key, value) {
    if (!(key in fiWatchers))
        return;
    for (let i in fiWatchers[key])
        fiWatchers[key][i].onNotify(key, value);
}
flatiron._notifySubscribers = function (key, value) {
    if (!fiSubscribers)
        return;

    for (let i in fiSubscribers['*'])
        fiSubscribers['*'][i](key, value);

    for (let i in fiSubscribers[key])
        fiSubscribers[key][i](key, value);
}



flatiron._watch = function (key, component) {
    if (!fiWatchers[key])
        fiWatchers[key] = {};
    fiWatchers[key][component._flatironid] = component;
}

flatiron._unwatch = function (watched, component) {
    for (let key in watched) {
        delete fiWatchers[key][component._flatironid];
    }

}

export default flatiron;