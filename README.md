# flatiron
Redux alternative, without the bloat and with tighter data to component mapping.  Currently a work in progress.

# Installation
`git clone git@github.com:joetex/flatiron.git`

Not yet released on npm, until the base functionality is working properly.

# Getting Started

flatiron is a global object, used with the concept of Services to call async or regular functions and add or update data, and Data Watching, to subscribe to specific data changes.

## Simple

[View example source](https://github.com/joetex/flatiron/tree/master/flatiron-examples/Simple)

**flatiron.set** lets you add any data into the global store by key name from anywhere.

**flatiron.connect** lets you specify an array of keys in string format to update component when those keys changed.

```javascript
//Run a query against DuckDuckGo API
export async function SearchDuckDuckGo(query) {
    let url = 'https://api.duckduckgo.com/?t=flatironExample&format=json&q=' + query;
    try {
        let response = await axios.get(url);
        let results = ReduceResults(response); //grabs only the results
        
        flatiron.set("ddg", response.data);
        flatiron.set("ddgQuery", query);
        flatiron.set("ddgResults", results);
        flatiron.set("ddgResultCount", results.length);
        flatiron.set("ddgError", false);
    }
    catch (error) {
        console.log(error);
        flatiron.set("ddgError", error);
    }
}

//...

//Show the search status

import React from 'react';
import flatiron from 'flatiron';

class SearchStatus extends React.Component {
    render() {
        if (this.props.ddgError)
            return (
                <div style={{ color: '#f00' }}>
                    {this.props.ddgError.message}
                </div>
            );
                
        if (!this.props.ddgResultCount || !this.props.ddgQuery)
            return (<div></div>);
            
        return (
            <div>
                <i>
                    Searched {this.props.ddgQuery}
                    with {this.props.ddgResultCount || 0} results.
                </i>
            </div>
        );
    }
}

export default flatiron.connect(['ddgQuery', 'ddgResultCount', 'ddgError'])(SearchStatus);
```

## Advanced

[View example source](https://github.com/joetex/flatiron/tree/master/flatiron-examples/Advanced)

**onCustomWatched** allows dynamic control on which items to watch (called only once during constructor).

**onCustomProps** allows mapping your own custom component props using key, value, store, or ownProps.  Components are notified every time `flatiron.set` is used on their watched keys.

**flatiron.get** gets a direct reference to the data in store.  Use **flatiron.copy** to make a deep copy instead.

**flatiron.set** supports object and array drill down. i.e. `'todos-a-b-10'` will get `store['todos']['a']['b'][10]`.  Both the parent `'todos'` and `'todos-a-b-10'` will notify watchers/subscribers when using flatiron.set.

```javascript
export function todoToggleComplete(id) {
    let todos = flatiron.get("todos");
    let todo = todos[id];
    if (!todo) return;
    
    todo.completed = !todo.completed;
    flatiron.set("todos-" + id, todo);
}

//...

class TodoResult extends React.Component {
    render() {
        return (
            <div className={this.props.completed ? "completed" : ""}
                onClick={() => { todoToggleComplete(this.props.id) }}>
                <span className="result-title">{this.props.desc}</span> -
                <span className="result-date">{this.props.dateCreated}</span>
            </div >
        );
    }
}

let onCustomWatched = (ownProps) => {
    return ['todos-' + ownProps.id];
}
let onCustomProps = (key, value, store, ownProps) => {
    return {
        ...value
    }
}
export default flatiron.connect([], onCustomWatched, onCustomProps)(TodoResult);
```
