import React from 'react';
import flatiron from 'flatiron';
import TodoResult from './TodoResult';

class TodoResults extends React.Component {
    render() {

        let todosSorted = this.props.todosSorted || [];

        let results = [];

        for (let i=0; i<todosSorted.length; i++) {
            let todo = todosSorted[i];
            results.push(
                <li key={"resultlist-" + todo.id}>
                    <TodoResult id={todo.id} />
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
        case 1: return todos.filter(todo => todo.completed === true);
        case 2: return todos.filter(todo => todo.completed === false);
        default: return todos;
    }
}


let onCustomProps = (key, value, state, ownProps) => {
    //if (key === 'todosFilter')
    return {
        todosSorted: filterTodos(state.todosSorted, state.todosFilter)
    }
    //return {};
}

export default flatiron.connect(['todosSorted', 'todosFilter'], null, onCustomProps)(TodoResults);