import React from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";
import ProjectList from "./pages/ProjectList";
import ProjectDetails from './pages/ProjectDetails'
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="App">
      <Navbar></Navbar>
      <Switch>
        {" "}
        {/* ADD */}
        <Route exact path="/projects" component={ProjectList} />
        <Route exact path="/projects/:id" component={ProjectDetails} />
      </Switch>
    </div>
  );
}

export default App;
