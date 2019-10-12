import React from 'react';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import SearchStatus from './components/SearchStatus';

function App() {
  return (
    <div className="App">
      <SearchBar />
      <SearchStatus />
      <SearchResults />
    </div>
  );
}

export default App;
