import React, { Component } from "react";
//import axios from "axios";
import { Link } from "react-router-dom";
import EditProject from "./../components/EditProject";
import AddTask from "../components/AddTask";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import service from "./../API/service";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

class ProjectDetails extends Component {
  state = {
    title: " ",
    description: " ",
    image: "",
    tasks: [],
  };

  componentDidMount() {
    this.getSingleProject();
  }

  getSingleProject = () => {
    const { id } = this.props.match.params;

    service
      .singleProject(id)
      .then((apiResponse) => {
        const theProject = apiResponse;
        console.log("theproject :>> ", theProject);
        //we added the _id to pass it to the taskdetails
        const { title, description, tasks, _id, image } = theProject;
        this.setState({ title, description, tasks, image, _id });
      })
      .catch((err) => console.log(err));
  };

  deleteProject = () => {
    // <== CREATE METHOD
    const { id } = this.props.match.params;

    service
      .projectDelete(id)
      .then(() => this.props.history.push("/projects")) // causes Router URL change
      .catch((err) => console.log(err));
  };

  render() {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ marginRight: "2em" }}>
            {" "}
            <img
              style={{ width: "120px", height: "90px" }}
              src={this.state.image}
              alt=""
            />{" "}
          </span>
          <div>
            <h1>Project Details</h1>
            <h2>{this.state.title}</h2>
            <h4>{this.state.description}</h4>
          </div>
        </div>{" "}
        {/*    // <--- ADD       */}
        <Link to={"/projects"}>
          {" "}
          {/*    // <--- ADD       */}
          <Button
          style={{marginBottom:'1em'}}
            variant="contained"
            color="default"
            startIcon={<ArrowBackIosIcon />}
          >
            Go Back
          </Button>
        </Link>
        <EditProject getTheProject={this.getSingleProject} /> {/* ADD */}
        <Button
          style={{ marginTop: "1em" }}
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          onClick={this.deleteProject}
        >
          {" "}
          Delete
        </Button>
        <AddTask getUpdatedProject={this.getSingleProject}></AddTask>
        {this.state.tasks.length === 0 ? (
          <h2>NO TASKS TO DISPLAY</h2>
        ) : (
          this.state.tasks.map((task) => {
            return (
              <Link
                key={task._id}
                to={`/projects/${this.state._id}/tasks/${task._id}`}
              >
                <div className="task">
                  <h2>{task.title}</h2>
                </div>
              </Link>
            );
          })
        )}
      </div>
    );
  }
}

export default ProjectDetails;
