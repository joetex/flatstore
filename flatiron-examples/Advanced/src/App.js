import React from 'react';
import TodoInput from './components/TodoInput';
import TodoResults from './components/TodoResults';
import TodoUndoRedo from './components/TodoUndoRedo';
import TodoFilter from './components/TodoFilter';

function App() {
  return (
    <div className="App">
      <TodoInput />
      <TodoFilter />
      <TodoResults />
      <TodoUndoRedo />
    </div>
  );
}

export default App;
