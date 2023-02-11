import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home.js";
import Token from "./Token.js";
import Simple from "./Simple.js";

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<Token />} /> */}
      {/* <Route path="/" element={<Home />} /> */}
      <Route path="/" element={<Simple />} />
    </Routes>
  );
}

export default App;
