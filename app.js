require("dotenv/config");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const { createNewUser, isValidUser } = require("./database.js");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
const port = 8000;

app.post("/login", (req, res, err) => {
  if (err) {
    //
  }
  const { email, password } = req.body;
  isValidUser({ email: email, password: password })
    .then((response) => {
      if (response.result === 6) {
        res.status(200).send({ message: "Login Successful" });
      } else {
        res.status(400).send({ message: "Invalid Credentials" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("An error occurred", error);
    });
});

app.post("/register", (req, res, err) => {
  //   console.log("ola");
  if (err) {
    //
  }
  //user exist or user dont exist
  let result;
  try {
    createNewUser(req.body).then((result) => {
      res.send({ result: result, userDataTaken: false });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
