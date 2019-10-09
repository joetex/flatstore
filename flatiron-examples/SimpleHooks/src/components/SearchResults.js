import React from 'react';
import flatiron from 'flatiron';
import SearchResult from './SearchResult';

const SearchResults = (props)=>{
    let ddgResults = props.ddgResults || [];

    let results = [];

    for (let i in ddgResults) {
        let result = ddgResults[i];
        results.push(
            <li key={"resultlist-" + i}>
                <SearchResult key={"result-" + i} title={result.Text} link={result.FirstURL} />
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

export default flatiron.connect(['ddgResults'])(SearchResults);