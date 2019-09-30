import React from 'react';
import { todoShowAll, todoShowCompleted, todoShowNotCompleted } from '../services/todo';

class TodoFilter extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <span onClick={todoShowAll}>
                    All
                </span>,
                <span onClick={todoShowCompleted}>
                    Completed
                </span>,
                <span onClick={todoShowNotCompleted}>
                    Not Completed
                </span>
            </div >
        );
    }
}

export default TodoFilter;