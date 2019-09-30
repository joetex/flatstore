import React from 'react';
import flatiron from 'flatiron';
import TodoResult from './TodoResult';

class TodoResults extends React.Component {
    render() {

        let todos = this.props.todos || [];

        let results = [];

        for (let i in todos) {
            results.push(
                <li key={"resultlist-" + i}>
                    <TodoResult id={todos[i].id} />
                </li>
            )
        }

        return (
            <div>
                <ol>
                    {results}
                </ol>
            </div>
        );
    }
}

function filterTodos(todos, filterType) {
    switch (filterType) {
        case 1: return todos.filter(todo => todo.completed == true);
        case 2: return todos.filter(todo => todo.completed == false);
    }
    return todos
}


let onCustomProps = (key, state, ownProps) => {
    if (key === 'todosFilter')
        return {
            todos: filterTodos(state.todos, state.todosFilter)
        }
    return {};
}

export default flatiron.connect(['todos', 'todosFilter'], null, onCustomProps)(TodoResults);