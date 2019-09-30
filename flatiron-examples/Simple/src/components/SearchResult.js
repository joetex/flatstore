import React from 'react';

class SearchResult extends React.Component {
    render() {
        return (
            <div>
                <a href={this.props.link}>
                    <span className="result-title">{this.props.title}</span>
                </a>
            </div>
        );
    }
}

export default SearchResult;