import React from "react";
import ReactDOM from "react-dom/client";

import { createStore } from "redux";
import reducer from "./reducer";

const store = createStore(reducer);

const App = () => {
  const handleGood = () => {
    store.dispatch({ type: "GOOD" });
  };

  const handleOk = () => {
    store.dispatch({ type: "OK" });
  };

  const handleBad = () => {
    store.dispatch({ type: "BAD" });
  };

  const handleReset = () => {
    store.dispatch({ type: "ZERO" });
  };

  const { good, ok, bad } = store.getState();

  return (
    <div>
      <button onClick={handleGood}>good</button>
      <button onClick={handleOk}>ok</button>
      <button onClick={handleBad}>bad</button>
      <button onClick={handleReset}>reset stats</button>

      <div>good {good}</div>
      <div>ok {ok}</div>
      <div>bad {bad}</div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

const renderApp = () => {
  root.render(<App />);
};

renderApp();
store.subscribe(renderApp);
