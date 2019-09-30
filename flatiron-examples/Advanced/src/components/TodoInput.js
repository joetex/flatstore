import React from 'react';
import { todoCreate } from '../services/todo';

class TodoInput extends React.Component {

    constructor(props) {
        super(props);
        this.description = "test";
        this.onChange = this.onChange.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    create() {
        todoCreate(this.description);
        this.input.value = "";
        this.input.focus();
    }
    componentDidMount() {
        this.input.focus();
        this.input.value = this.description;
    }

    onKeyUp(event) {
        if (event.keyCode === 13) {
            this.create();
        }
    }

    onChange(event) {
        this.description = event.target.value;
    }

    render() {
        return (
            <div>
                <label htmlFor="todoInput">Search</label>
                <input
                    id="todoInput"
                    type="text"
                    name="todoInput"
                    onChange={this.onChange}
                    onKeyUp={this.onKeyUp}
                    ref={(input) => { this.input = input; }} />
                <button
                    name="searchSubmit"
                    onClick={() => { this.create() }}>
                    Submit
                </button>
            </div>
        );
    }
}

export default TodoInput;