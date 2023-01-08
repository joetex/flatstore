# flatstore

Redux alternative, Flat storage with tighter data to component mapping.

# Installation

`npm install flatstore --save`

# Getting Started

flatstore is a global key/value storage. It connects to components using hooks for functional components and a higher-order component for class components to re-render on data changes for any keys being watched.

Differences from Redux:

- Data is mutable at the global level.
- Simplified component connect for watching specific keys
- Support for storing historical changes for any specific key
- Supports object drilldown syntax, i.e. `state.player.name` where `.` is delimeter for next child object
- Supports undo/redo (if used with historical)
- Updates props everytime `flatstore.set` is called, letting react handle if re-render is needed.

---

## Hooks

### `flatstore.useWatch(key)`

Watch for changes against the specified key. This will update the functional component whenever someone uses `flatstore.set(key)`

#### Example Usage

```js
function onChange() {
  flatstore.set("player", "Joe");
}

function DisplayPlayer(props) {
  let [player] = flatstore.useWatch("player");
  return <span>{player}</span>;
}
```

##### Parameters

- `key` (string) - the key that you want to watch for changes

---

## Methods

### `flatstore.set(key, value)`

Set a value to a key in the global storage. If any component is using `useWatch`, the component will rerender. Or, if subscribed to a key, the callback will be called.

##### Parameters

- `key` (string) - the key that you want to update
- `value` (any) - the value that you want to store at the specified key

---

### `flatstore.get(key)`

Get a value from the global storage. It is mutable.

##### Parameters

- `key` (string) - the key to retrieve the value

##### Returns

`value` (any) - value that is stored at the specified key

---

### `flatstore.delimiter(delim)`

Sets the delimiter for string traversal of object or array.

##### Parameters

- `delim` (character) - a single character that will be delimit the keys for object traversal

##### Example

```js
flatstore.delimiter("|");
let family = { parent: { child: { money: 10 } } };
flatstore.set("test", family);
let money = flatstore.get("test|parent|child|money");
```

---

### `flatstore.copy(key)`

Copy the value, so it is immutable.

##### Parameters

- `key` (string) - the key to retrieve the value

##### Returns

`value` (any) - value that is stored at the specified key

---

### `flatstore.subscribe(key, callback)`

Subscribe to a key that will trigger the callback function when someone uses `flatstore.set(key,value)`

##### Parameters

- `key` (string) - the key that you want to update
- `callback` (function) - Function that is called when the value at `key` changes.

##### Example

```js
flatstore.subscribe('test', (key, value) => {
    console.log('test was updated: ', value)
}

flatstore.set('test', 'hello!');
```

---

## Simple Example

[View example source](https://github.com/joetex/flatstore-examples/tree/master/Simple)

**flatstore.set** lets you add any data into the global store by key name from anywhere.

**flatstore.useWatch** lets you specify a key to watch for changes.

```javascript
//Run a query against DuckDuckGo API
export async function SearchDuckDuckGo(query) {
  let url =
    "https://api.duckduckgo.com/?t=flatstoreExample&format=json&q=" + query;
  try {
    let response = await axios.get(url);
    let results = ReduceResults(response); //grabs only the results

    flatstore.set("ddg", response.data);
    flatstore.set("ddgQuery", query);
    flatstore.set("ddgResults", results);
    flatstore.set("ddgResultCount", results.length);
    flatstore.set("ddgError", false);
  } catch (error) {
    console.log(error);
    flatstore.set("ddgError", error);
  }
}

//...

//Show the search status

import React from "react";
import flatstore from "flatstore";

function SearchStatus(props) {
  let [ddgQuery] = flatstore.useWatch("ddgQuery");
  let [ddgResultCount] = flatstore.useWatch("ddgResultCount");
  let [ddgError] = flatstore.useWatch("ddgError");

  if (ddgError) return <div style={{ color: "#f00" }}>{ddgError.message}</div>;

  if (!ddgResultCount || !ddgQuery) return <div></div>;

  return (
    <div>
      <i>
        Searched {ddgQuery}
        with {ddgResultCount || 0} results.
      </i>
    </div>
  );
}

export default SearchStatus;
```

## Advanced Example (legacy class components)

[View example source](https://github.com/joetex/flatstore-examples/tree/master/Advanced)

**onCustomWatched** allows dynamic control on which items to watch (called only once during constructor).

**onCustomProps** allows mapping your own custom component props using key, value, store, or ownProps. Components are notified every time `flatstore.set` is used on their watched keys.

**flatstore.get** gets a direct reference to the data in store. Use **flatstore.copy** to make a deep copy instead.

**flatstore.set** supports object and array drill down. i.e. `'todos-a-b-10'` will get `store['todos']['a']['b'][10]`. Both the parent `'todos'` and `'todos-a-b-10'` will notify watchers/subscribers when using flatstore.set.

```javascript
export function todoToggleComplete(id) {
  let todos = flatstore.get("todos");
  let todo = todos[id];
  if (!todo) return;

  todo.completed = !todo.completed;
  flatstore.set("todos-" + id, todo);
}

//...

class TodoResult extends React.Component {
  render() {
    return (
      <div
        className={this.props.completed ? "completed" : ""}
        onClick={() => {
          todoToggleComplete(this.props.id);
        }}
      >
        <span className="result-title">{this.props.desc}</span> -
        <span className="result-date">{this.props.dateCreated}</span>
      </div>
    );
  }
}

let onCustomWatched = (ownProps) => {
  return ["todos-" + ownProps.id];
};
let onCustomProps = (key, value, store, ownProps) => {
  return {
    ...value,
  };
};
export default flatstore.connect(
  [],
  onCustomWatched,
  onCustomProps
)(TodoResult);
```
