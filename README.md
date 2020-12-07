# Cloudinary Setup - Server and Client side with JSX



### 1. Create free Cloudinary account

Register for free here: https://cloudinary.com/users/register/free



# => SERVER SIDE



### 2. Install packages

Install the following 3 packages in your project folder:

- [cloudinary](https://www.npmjs.com/package/cloudinary)
- [multer-storage-cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)
- [multer](https://www.npmjs.com/package/multer) => like body-parser, Multer parses incoming bodies but also allows us to parse files (unlike body-parser that parses only data)

In your terminal ***Important install these exactly versions, if not the configuration prepared won't work***:

```
npm install cloudinary@1.21.0 multer-storage-cloudinary@2.2.1 multer@1.4.2 --save --save-exact
```



### 3. Add the Cloudinary keys to the `.env` file

Add the following fields to your `.env` and update the variable values.

You will find the example of the variable names you should create in the `.env.sample` file.

```
CLOUDINARY_CLOUD_NAME=paste-your-cloudinary-cloud-name-here
CLOUDINARY_API_KEY=paste-your-cloudinary-api-key-here
CLOUDINARY_API_SECRET=paste-your-cloudinary-api-secret-here
```



Copy the variable values coming from your Cloudinary account Dashboard.

[![img](https://camo.githubusercontent.com/6ea785b11bde2f32f77c07456c8b5cf13525a68efc040838a3fc8e59d96ad87a/68747470733a2f2f692e696d6775722e636f6d2f6a7444587333522e706e67)](https://camo.githubusercontent.com/6ea785b11bde2f32f77c07456c8b5cf13525a68efc040838a3fc8e59d96ad87a/68747470733a2f2f692e696d6775722e636f6d2f6a7444587333522e706e67)



### 4. Configure Cloudinary & Multer

In your terminal, on the server folder:

```
mkdir config 
touch config/cloudinary-setup.js
```

##### `config/cloudinary-setup.js`

```javascript
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var storage =  cloudinaryStorage({
    //A Cloudinary API object
  cloudinary,
  folder: "project-mg-gallery", // The name of the folder in cloudinary
  allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
  // params: { resource_type: 'raw' }, => this is in case you want to upload other type of files, not just images
    //you can preset some properties for the image
  transformation: [{ width: 120, height: 90, crop: 'fill' }],
    //public_id of the file on cloudinary
  filename: function (req, res, cb) {
    let fileName = res.originalname.split(".");
    cb(null, fileName[0]); // The file on cloudinary would have the same name as the original file name
  },
});

const uploader = multer({ storage });
module.exports = uploader;
```



### 4.1. Adapt the project model

##### `models/project.model.js`

```javascript
//      models/project.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: String,
     //Insert the image property on the project sechema.
  image: String,
  description: String,
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  // The owner will be added later on
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;

```



### 4.2 Include Cloudinary on the routes, and inject the parsing middleware into the route

In the router where we want to upload the image:

- Import the parsing middleware we created in `config/cloudinary.js`.
- Add it as a middleware (a second argument ) prior to the route handler function that handles the POST request.

##### `routes/project.router.js`

```javascript
//      routes/project-routes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

//require uploader, already exported from cloudinary-setup.js
const uploader = require("./../configs/cloudinary-setup");

const Project = require("./../models/project.model");
const Task = require('./../models/task.model');

// include CLOUDINARY:
//upload a single image per once.
// ADD an horitzontal middleware
router.post("/upload", uploader.single("image"), (req, res, next) => {
  console.log("file is: ", req.file);

  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }
  // get secure_url from the file object and save it in the
  // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
  res.json({ secure_url: req.file.secure_url });
});

// POST '/api/projects'
//Insert the image property coming from the body, from the form
router.post("/projects", (req, res, next) => {
  const { title, description, image } = req.body;

  Project.create({ title, description, image, tasks: [] })
    .then((createdProject) => {
      res.status(201).json(createdProject);
    })
    .catch((err) => {
      res
        .status(500) // Internal Server Error
        .json(err);
    });
});

//	...

//	...


module.exports = router;

```





# => CLIENT SIDE



### 1. Install packages

Install the following  packages in your client folder to get access to Material-UI framework:

- [Material-UI](https://material-ui.com/getting-started/installation/)

In your terminal, to install the core of the framework.

```
npm install @material-ui/core
```

In your terminal, In order to use prebuilt SVG Material icons.

```
npm install @material-ui/icons
```



### 2. Update the `AddProject` view 

##### `src/components/AddProject.jsx`

```jsx
import React, { Component } from "react";
import axios from "axios";
//imported from the material-ui framework
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import IconButton from "@material-ui/core/IconButton";
import PhotoCamera from "@material-ui/icons/PhotoCamera";

class AddProject extends Component {
  constructor(props) {
    super(props);
      //We added image property on the state
    this.state = { image: "", title: "", description: "" };
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleFormSubmit = (event) => {
    event.preventDefault();
      //We added image property on the state
    const { title, description, image } = this.state;

    axios
    //on the request, we added also the image
      .post("http://localhost:5000/api/projects", { title, description, image })
      .then(() => {
        this.props.getData(); // leave this comment - we will used it later
        //We empty the form
        this.setState({ title: "", description: "", image: "" });
      })
      .catch((err) => console.error(err));
  };

{/* NEW METHOD TO HANDLE THE FILE UPLOAD*/}

  // this method handles just the file upload
  handleFileUpload = (e) => {
    console.log("The file to be uploaded is: ", e.target.files);
    const file = e.target.files[0];

    const uploadData = new FormData();
    // image => this name has to be the same as in the model since we pass
    // req.body to .create() method when creating a new project in '/api/projects' POST route
    uploadData.append("image", file);

    axios
      .post("http://localhost:5000/api/upload", uploadData, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("response is: ", response);
        // after the console.log we can see that response carries 'secure_url' which we can use to update the state
        this.setState({ image: response.data.secure_url });
      })
      .catch((err) => {
        console.log("Error while uploading the file: ", err);
      });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <input
            style={{ display: "none" }}
            id="icon-button-file"
            type="file"
            onChange={this.handleFileUpload}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <PhotoCamera fontSize="large"/>
            </IconButton>
          </label>
            {/* Here we could see the image that we want to add before uploading */}
          <span>
            <img
              style={{ width: "100px" }}
              src={this.state.image && this.state.image}
              alt=""
            ></img>
          </span>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={this.state.title}
            onChange={(e) => this.handleChange(e)}
          />
          <label>Description:</label>
          <textarea
            name="description"
            value={this.state.description}
            onChange={(e) => this.handleChange(e)}
          />
          <div>
            <Button
              style={{ marginTop: "1em", backgroundColor: "green" }}
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveIcon />}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

export default AddProject;
```



### 2. Update the ProjectList view 

- `src/components/ProjectList.jsx`

```jsx
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
     axios.get(`http://localhost:5000/api/projects`)
         .then((apiResponse) => {
      this.setState({ listOfProjects: apiResponse });
    });
  };

  render() {
    const { listOfProjects } = this.state; //  <--  ADD

    return (
      <div>
        <AddProject getData={this.getAllProjects} />
        <div>
          {listOfProjects.map((project) => (
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

```



