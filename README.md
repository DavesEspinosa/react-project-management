# Cloudinary Setup - Server and Client side with JSX



### 1. Create free Cloudinary account

Register for free here: https://cloudinary.com/users/register/free



### 2. Install packages

Install the following 3 packages in your project folder:

- [cloudinary](https://www.npmjs.com/package/cloudinary)
- [multer-storage-cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)
- [multer](https://www.npmjs.com/package/multer) => like body-parser, Multer parses incoming bodies but also allows us to parse files (unlike body-parser that parses only data)

In your terminal:

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
touch config/cloudinary.js
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
  cloudinary,
  folder: "project-mg-gallery", // The name of the folder in cloudinary
  allowedFormats: ['jpg', 'png', 'jpeg', 'gif'],
  // params: { resource_type: 'raw' }, => this is in case you want to upload other type of files, not just images
  transformation: [{ width: 120, height: 90, crop: 'fill' }],
  filename: function (req, res, cb) {
    let fileName = res.originalname.split(".");
    cb(null, fileName[0]); // The file on cloudinary would have the same name as the original file name
  },
});

const uploader = multer({ storage });
module.exports = uploader;
```



### 4.2 Include Cloudinary on the routes

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



### 5. Create/update the `Signup` view form

- Add the attribute `encType="multipart/form-data"` to your form (in HTML `enctype`) .
- Add the element `<input type="file" name="profilepic"/>` to the form. This input is used to upload the image and send it during the form submission.

##### `views/Signup.jsx`

```jsx
const React = require("react");
const Layout = require("./Layout");

function Signup() {
  return (
    <Layout title="Signup Page">
      <h2>Cloudinary Example</h2>
      <form action='/auth/signup' method='POST' encType="multipart/form-data" >
  
        <label>Email</label>
        <input type='text' name='email' />

        <label>Password</label>
        <input type='password' name='password'/>

        <label>Profile picture</label>
        <input type='file' name='profilepic'/>

        <button type='submit'>Sign Up</button>
      </form>
    </Layout>
  );
}

module.exports = Signup;
```



### 6. Inject the parsing middleware into the route

In the router where we want to upload the image:

- Import the parsing middleware we created in `config/cloudinary.js`.
- Add it as a middleware (a second argument ) prior to the route handler function that handles the POST request.

##### `routes/authRouter.js`

```javascript
const parser = require('./../config/cloudinary');

// ...

// ...


// POST     /auth/signup
authRouter.post('/signup', parser.single('profilepic'), (req, res, next) => {
  // `multer` parses the incoming image coming from the form data and upload's it using 
  // the middleware `parse.single('profilepic') we set above.
  
  
  // The URL of the image uploaded to the cloudinary servers by the middleware becomes available via the `req.file.secure_url` property
  let imageUrl;
  if (req.file) imageUrl = req.file.secure_url; // check if the image was selected/uploaded
  
  const newUser = { email, password, image: imageUrl };

  
  // Here we usually have our authentication/signup logic... 
  // ...checking email/password, hashing password, etc.

  User.create(newUser)
    .then((createdUser) => {
      createdUser.password = '***';
      req.session.currentUser = createdUser;
      
      res.redirect('/profile');
    })
    .catch((err) => console.log(err));
}
            
                
```



### 7. Display the uploaded photo in `Profile` view



### Documentation

[Cloudinary](