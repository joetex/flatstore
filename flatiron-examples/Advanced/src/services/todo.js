import flatiron from 'flatiron';

// let FILTER_ALL = 0;
// let FILTER_UNCOMPLETED = 1;
// let FILTER_COMPLETED = 2;

var todoIndex = 0;
// var todoFilterType = FILTER_ALL;

let defaultTodos = {};
flatiron.historical('todos');
flatiron.set("todos", defaultTodos);
flatiron.set("todosSorted", []);
flatiron.set("todosFilter", 0);


export function todoCreate(item) {

    let todos = flatiron.get("todos");

    if (!todos)
        todos = {};

    let todo = {};
    todo.id = ++todoIndex;
    todo.desc = item;
    todo.dateCreated = (new Date()).toLocaleString("en-US");
    todo.completed = false;

    todos[todo.id] = todo;

    flatiron.set("todos-" + todo.id, todo);

    todoSort(todos);
}

export function todoToggleComplete(id) {

    let todos = flatiron.get("todos");

    let todo = todos[id];
    if (!todo)
        return;
    todo.completed = !todo.completed;

    flatiron.set("todos-" + id, todo);
    //flatiron.set("todos", todos);
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
    
    let todos = flatiron.get("todos");
    todoSort(todos);
}

export function todoRedo() {
    flatiron.redo("todos");
    
    let todos = flatiron.get("todos");
    todoSort(todos);
}

export function todoSort(todos) {
    let sorted = [];
    for (let i in todos) {
        sorted.push(todos[i]);
    }
    sorted = todoSortByDate(sorted);
    flatiron.set("todosSorted", sorted);
}

function todoSortByDate(todos) {
    return todos.sort((a, b) => {
        return (new Date(b.dateCreated)).getTime() - (new Date(a.dateCreated)).getTime();
    })
}


