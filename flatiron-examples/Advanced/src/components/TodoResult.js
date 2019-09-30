import React from 'react';
import flatiron from 'flatiron';
import { todoToggleComplete } from '../services/todo';

class TodoResult extends React.Component {


    render() {
        return (
            <div
                key={"result-" + this.props.id}
                className={this.props.completed ? "completed" : ""}
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