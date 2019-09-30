import React from 'react';
import flatiron from 'flatiron';

import { SearchDuckDuckGo } from '../services/DuckDuckGo';

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.query = "test";
        this.onChange = this.onChange.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    componentDidMount() {
        this.input.focus();
        this.input.value = this.query;
    }

    onKeyUp(event) {
        if (event.keyCode === 13) {
            SearchDuckDuckGo(this.query);
        }
    }

    onChange(event) {
        this.query = event.target.value;
    }

    render() {
        return (
            <div>
                <label htmlFor="ddgQuery">Search</label>
                <input
                    id="ddgQuery"
                    type="text"
                    name="ddgQuery"
                    onChange={this.onChange}
                    onKeyUp={this.onKeyUp}
                    ref={(input) => { this.input = input; }} />
                <button
                    name="searchSubmit"
                    onClick={() => { SearchDuckDuckGo(this.query) }}>
                    Submit
                </button>
            </div>
        );
    }
}

export default SearchBar;