import React, { Component } from "react";
import { Link } from "react-router-dom";
// import axios from "axios";
import AddProject from "./../components/AddProject";
import service from "./../API/service";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

class ProjectList extends Component {
  state = {
    listOfProjects: [],
  };

  componentDidMount() {
    this.getAllProjects();
    //  fetch the data from API after the initial render, and save it in the state
  }

  getAllProjects = () => {
    service.allProjects().then((apiResponse) => {
      console.log("apiResponse :>> ", apiResponse);
      this.setState({ listOfProjects: apiResponse });
    });
  };

  render() {
    const { listOfProjects } = this.state; //  <--  ADD

    return (
      <div>
        {/* After adding a project, we will call `getData` to get all projects again */}
        <AddProject getData={this.getAllProjects} />{" "}
        {/*    // <-- UPDATE     */}
        <div>
          {listOfProjects.map((
            project //   <-- ADD
          ) => (
            <div key={project._id} className="project">
              <Link to={`/projects/${project._id}`}>
                <Card >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      alt="Contemplative Reptile"
                      height="140"
                      image={project.image}
                      title="Contemplative Reptile"
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        {project.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        {project.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default ProjectList;
