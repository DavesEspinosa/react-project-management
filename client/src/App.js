import React from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";
import ProjectList from "./pages/ProjectList";
import ProjectDetails from "./pages/ProjectDetails";
import Navbar from "./components/Navbar";
import TaskDetails from "./pages/TaskDetails.jsx";

function App() {
  return (
    <div className="App">
      <Navbar></Navbar>
      <Switch>
        {" "}
        {/* ADD */}
        <Route exact path="/projects" component={ProjectList} />
        <Route exact path="/projects/:id" component={ProjectDetails} />
        <Route
          exact
          path="/projects/:id/tasks/:taskId"
          component={TaskDetails}
        />
      </Switch>
    </div>
  );
}

export default App;
