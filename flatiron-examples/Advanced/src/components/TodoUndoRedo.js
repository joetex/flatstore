import React from 'react';
import { todoUndo, todoRedo } from '../services/todo';

class TodoUndoRedo extends React.Component {


    undo() {
        todoUndo();
    }

    redo() {
        todoRedo();
    }

    render() {
        return (
            <div>
                <button
                    name="todoUndo"
                    onClick={this.undo}>
                    Undo
                </button>
                <button
                    name="todoRedo"
                    onClick={this.redo}>
                    Redo
                </button>
            </div>
        );
    }
}

export default TodoUndoRedo;