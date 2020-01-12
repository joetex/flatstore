import React from 'react';
import cloneDeep from 'lodash/cloneDeep';

var flatstore = {};  //main library
var fiStore = {};   //global store
var fiWatchers = {};    //component watchers
var fiWatchersChildren = {}; //component watchers for drill down keys 
var fiIncrementIndex = 0; //HOC indexing
var fiSubscribers;  //global subscribers (outside components)
var fiHistoryIndex = {}; //index of history
var fiHistory = {}; //history list of copied states
var delimiter = "-";

flatstore.delimiter = function (d) {
    delimiter = d;
}

flatstore.get = function (key) {
    let value;
    try {
        value = _getChild(fiStore, key);
    } catch (error) {
        throw new Error("[flatstore.get] ERROR: Key '" + key + "' not valid.");
    }

    return value;
}

flatstore.copy = function (key) {
    let value = flatstore.get(key);
    return cloneDeep(value);
}

flatstore.set = function (key, newValue) {
    let parent = key;
    try {
        parent = _setChild(fiStore, key, newValue);
    } catch (error) {
        throw new Error("[flatstore.set] ERROR: Key '" + key + "' not valid.");
    }

    flatstore._notifyHistory(parent, fiStore[parent]);
    flatstore._notifyComponents(parent, fiStore[parent]);
    flatstore._notifySubscribers(parent, fiStore[parent]);

    if (parent !== key) {
        flatstore._notifyComponents(key, newValue);
        flatstore._notifySubscribers(key, newValue);
    } else {
        flatstore._notifyChildren(parent);
    }
}

flatstore.setWithObj = function (obj) {
    for (let i in obj) {
        const key = i
        const newValue = obj[i]
        let parent = key;
        try {
            parent = _setChild(fiStore, key, newValue);
        } catch (error) {
            throw new Error("[flatstore.set] ERROR: Key '" + key + "' not valid.");
        }

        flatstore._notifyHistory(parent, fiStore[parent]);
        flatstore._notifyComponents(parent, fiStore[parent]);
        flatstore._notifySubscribers(parent, fiStore[parent]);

        if (parent !== key) {
            flatstore._notifyComponents(key, newValue);
            flatstore._notifySubscribers(key, newValue);
        } else {
            flatstore._notifyChildren(parent);
        }
    }
}
flatstore.subscribe = function (key, callback) {
    if (!(callback instanceof Function))
        throw new Error("[flatstore.subscribe] ERROR: callback must be a function.");
    if (!fiSubscribers)
        fiSubscribers = {};

    if (!fiSubscribers[key])
        fiSubscribers[key] = [];
    fiSubscribers[key].push(callback);
}

flatstore.undo = function (key) {
    if (!(key in fiHistory))
        throw new Error("[flatstore.undo] ERROR: Key '" + key + "' does not have historical state");

    let index = fiHistoryIndex[key] - 2;
    if (index < 0)
        index = 0;
    fiHistoryIndex[key] = index + 1;
    flatstore._setHistory(key, cloneDeep(fiHistory[key][index]));
    return fiHistory[key][index];
}

flatstore.redo = function (key) {
    if (!(key in fiHistory))
        throw new Error("[flatstore.redo] ERROR: Key '" + key + "' does not have historical state");
    let index = fiHistoryIndex[key];
    if (index >= fiHistory[key].length)
        index = fiHistory[key].length - 1;
    fiHistoryIndex[key] = index + 1;
    flatstore._setHistory(key, cloneDeep(fiHistory[key][index]));
    return fiHistory[key][index];
}

flatstore.historical = function (key) {
    fiHistory[key] = [];
    fiHistoryIndex[key] = 0;
}

function _arrayEquals(a, b) {
    if (!a || !b) return false;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
}

flatstore.connect = function (watchedKeys, onCustomWatched, onCustomProps) {
    return function (WrappedComponent) {
        return class extends React.Component {
            constructor(props) {
                super(props);

                this.watched = {};
                this.onCustomWatched = null;
                this._flatstoreid = fiIncrementIndex++;

                if (onCustomWatched instanceof Function)
                    this.onCustomWatched = onCustomWatched;

                this.state = this.processWatched(true);
            }

            componentWillUnmount() {
                flatstore._unwatch(this.watched, this);
            }

            processWatched(isConstructor) {
                if (this.onCustomWatched) {
                    let previousWatchedKeys = watchedKeys;
                    watchedKeys = this.onCustomWatched({ ...this.props, ...this.state });
                    if (!_arrayEquals(previousWatchedKeys, watchedKeys)) {
                        flatstore._unwatch(this.watched, this);
                        this.watched = {};
                    }
                }

                if (!Array.isArray(watchedKeys))
                    throw new Error("[flatstore.ProcessWatched] ERROR: parameter watchList '" + typeof watchedKeys + "' must return array of strings.");

                let componentState = {};

                for (let i in watchedKeys) {
                    let key = watchedKeys[i];

                    if (!(key in this.watched)) {
                        flatstore._watch(key, this);
                        this.watched[key] = true;
                        if (isConstructor) {
                            let customState = this.onNotify(key, flatstore.copy(key), isConstructor);
                            Object.assign(componentState, customState);
                        }
                    }
                }

                return componentState;
            }

            onNotify(key, value, isConstructor) {
                let componentState = {};
                componentState[key] = value;

                if (onCustomProps instanceof Function) {
                    let customComponentState = onCustomProps(key, value, Object.assign({}, fiStore), { ...this.props, ...this.state });
                    Object.assign(componentState, customComponentState);
                }

                // if (this.onCustomWatched)
                //     this.processWatched();

                if (!isConstructor)
                    this.setState(componentState);
                return componentState;
            }

            render() {
                return React.createElement(WrappedComponent, { ...this.state, ...this.props }, this.props.children);
            }
        };
    }
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
    return path[0];
}

flatstore._setHistory = function (key, newValue) {
    let oldValue = fiStore[key];
    let parent = _setChild(fiStore, key, newValue);

    flatstore._notifyComponents(key, newValue);
    flatstore._notifySubscribers(key, newValue);
    flatstore._notifyChildren(parent);
}

flatstore._notifyChildren = function (key) {
    if (!Array.isArray(fiStore[key]) && !(fiStore[key] instanceof Object))
        return;
    for (var childKey in fiWatchersChildren[key]) {
        let newValue = flatstore.get(childKey);
        flatstore._notifyComponents(childKey, newValue);
        flatstore._notifySubscribers(childKey, newValue);
    }
}

flatstore._notifyHistory = function (key, value) {
    if (!(key in fiHistory))
        return;

    value = cloneDeep(value);
    let index = fiHistoryIndex[key];
    if (index == fiHistory[key].length) {
        fiHistory[key].push(value);
        fiHistoryIndex[key] = fiHistory[key].length;
    }
    else {
        fiHistory[key] = fiHistory[key].slice(0, index);
        fiHistory[key][index] = value;
        fiHistoryIndex[key] = index + 1;
    }
}
flatstore._notifyComponents = function (key, value) {
    if (!(key in fiWatchers))
        return;
    for (let i in fiWatchers[key])
        fiWatchers[key][i].onNotify(key, value);
}
flatstore._notifySubscribers = function (key, value) {
    if (!fiSubscribers)
        return;

    for (let i in fiSubscribers['*'])
        fiSubscribers['*'][i](key, value);

    for (let i in fiSubscribers[key])
        fiSubscribers[key][i](key, value);
}



flatstore._watch = function (key, component) {
    if (!fiWatchers[key])
        fiWatchers[key] = {};
    fiWatchers[key][component._flatstoreid] = component;
    let delimiterPos = key.indexOf(delimiter);
    if (delimiterPos > -1) {
        let parentKey = key.substring(0, delimiterPos);
        if (!fiWatchersChildren[parentKey])
            fiWatchersChildren[parentKey] = {};
        fiWatchersChildren[parentKey][key] = true;
    }
}

flatstore._unwatch = function (watched, component) {
    for (let key in watched) {
        delete fiWatchers[key][component._flatstoreid];
    }

}

export default flatstore;