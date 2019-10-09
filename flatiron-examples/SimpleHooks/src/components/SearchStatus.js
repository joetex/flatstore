import React from 'react';
import flatiron from 'flatiron';

const SearchStatus = (props)=>{
    if (props.ddgError) {
        return (<div style={{ color: '#f00' }}>{props.ddgError.message}</div>)
    }

    if (!props.ddgResultCount || !props.ddgQuery)
        return (<div></div>)


    return (
        <div>
            <i>Searched '{props.ddgQuery}' with {props.ddgResultCount || 0} results.</i>
        </div>
    );
}

export default flatiron.connect(['ddgQuery', 'ddgResultCount', 'ddgError'])(SearchStatus);