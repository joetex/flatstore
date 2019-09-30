import flatiron from 'flatiron';
import cloneDeep from 'lodash/cloneDeep';

let FILTER_ALL = 0;
let FILTER_UNCOMPLETED = 1;
let FILTER_COMPLETED = 2;

var todoIndex = 0;
var todoFilterType = FILTER_ALL;

let defaultTodos = {};
flatiron.historical('todos');
flatiron.set("todos", defaultTodos);
flatiron.set("todosSorted", []);
flatiron.set("todosFilter", 0);


export function todoCreate(item) {

    let todos = flatiron.copy("todos");

    if (!todos)
        todos = {};

    let todo = {};
    todo.id = ++todoIndex;
    todo.desc = item;
    todo.dateCreated = (new Date()).toLocaleString("en-US");
    todo.completed = false;

    todos[todo.id] = todo;

    flatiron.set("todos-" + todo.id, todo);
    flatiron.set("todos", todoSortByDate(todos));
}

export function todoToggleComplete(id) {

    let todos = flatiron.copy("todos");

    let todo = todos.find(t => t.id == id);
    if (!todo)
        return;
    todo.completed = !todo.completed;

    flatiron.set("todos-" + id, todo);
    flatiron.set("todos", todos);
}

export function todoShowAll() {
    flatiron.set("todosFilter", 0);
}

export function todoShowCompleted() {
    flatiron.set("todosFilter", 1);
}

export function todoShowNotCompleted() {
    flatiron.set("todosFilter", 2);
}

export function todoUndo() {
    flatiron.undo("todos");
}

export function todoRedo() {
    flatiron.redo("todos");
}

function todoFinalize(todos) {

}

function todoSortByDate(todos) {
    return todos.sort((a, b) => {
        return (new Date(b.dateCreated)).getTime() - (new Date(a.dateCreated)).getTime();
    })
}


