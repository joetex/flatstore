import React, {useEffect, useRef, useState} from 'react';

import { SearchDuckDuckGo } from '../services/DuckDuckGo';

 const SearchBar = (props)=>{
     let [query, setQuery] = useState("test")
    const input = useRef(null)
    useEffect(()=>{
        input.current.focus()
        input.current.value=query
    })
    const onKeyUp =(event) =>{
        if (event.keyCode === 13) {
            SearchDuckDuckGo(query);
        }
    }
    const onChange = (event)=>{
        setQuery(event.target.value)
    }
    return (
        <div>
            <label htmlFor="ddgQuery">Search</label>
            <input
                id="ddgQuery"
                type="text"
                name="ddgQuery"
                onChange={onChange}
                onKeyUp={onKeyUp}
                ref={input} />
            <button
                name="searchSubmit"
                onClick={() => { SearchDuckDuckGo(query) }}>
                Submit
            </button>
        </div>
    );
}


/*class SearchBar extends React.Component {

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

*/
export default SearchBar;