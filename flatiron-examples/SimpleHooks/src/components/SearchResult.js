import React from 'react';

const SearchResult = (props)=>{
    return (
        <div>
            <a href={props.link}>
                <span className="result-title">{props.title}</span>
            </a>
        </div>
    );
}
export default SearchResult;