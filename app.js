require("dotenv/config");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

const { createNewUser, isValidUser } = require("./database.js");

const jwt = require("jsonwebtoken");
const { serialize } = require("cookie");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["https://comfy-kangaroo-c54143.netlify.app"],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
    origin: true,
  })
);

// app.use("/api");

const port = 8000;

const generateAccessToken = (email) => {
  return jwt.sign(email, process.env.JWT_SECRET, { expiresIn: "1800s" });
};

app.post("/api/login", (req, res, err) => {
  if (err) {
    //
  }
  // console.log("called i  was");
  const { email, password } = req.body;
  isValidUser({ email: email, password: password })
    .then((response) => {
      if (response.result === 6) {
        const token = generateAccessToken({ email: email });
        res.status(200).send({ message: "Login Successful", token: token });
      } else {
        res.status(400).send({ message: "Invalid Credentials" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("An error occurred", error);
    });
});

app.post("/api/register", (req, res, err) => {
  //   console.log("ola");
  if (err) {
    //
  }
  //user exist or user dont exist
  let result;
  try {
    createNewUser(req.body).then((result) => {
      const token = generateAccessToken({ email: req.body.email });
      res.send({ result: result, userDataTaken: false, token: token });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "An error occurred" });
  }
});

app.post("/api/counter", (req, res, err) => {
  if (err) {
    //
  }

  try {
    jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("err in jwt");
        console.log(err);
        return res.status(403).send("Invalid token.");
      }
      return res.status(200).send({ message: "success" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`);
});
