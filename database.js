require("dotenv/config");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);
const userSignUpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
});

userSignUpSchema.pre("save", function (next) {
  const user = this;
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(saltRounds, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }

          user.password = hash;
          next();
        });
      }
    });
  } else {
    return next();
  }
});

const UserSignUp = mongoose.model("UserSignUp", userSignUpSchema);

var createNewUser = async (data) => {
  let username = data.email;
  let userExistWithUsername = await doesUsernameExist(username);
  console.log("userExistWithUsername");
  console.log(userExistWithUsername);
  if (userExistWithUsername === 1) {
    if (data.password === "") {
      return 3;
    }
    return 1;
  }
  const newUser = new UserSignUp({
    email: data.email,
    password: data.password,
  });
  try {
    newUser.save();
    return 4;
  } catch (error) {
    console.log(error);
  }
  return 0;
};

const doesUsernameExist = async (username) => {
  let result;
  try {
    const users = await UserSignUp.find({ email: username });
    if (users.length == 0) {
      result = 2;
    } else {
      result = 1;
    }
  } catch (error) {
    console.log(error);
  }
  return result;
};

const isValidUser = async (user) => {
  let result;
  let { email, password } = user;
  result = await UserSignUpFindData(email, password);
  let userDataTaken = false;
  if (result === 2 && password === "") {
    result = await createNewUser(user);
  }
  if (result === 6) {
    const data = await UserSignUp.find({ email: email });
    userDataTaken = data[0].userDataTaken;
  }
  return { result: result, userDataTaken: userDataTaken };
};

const UserSignUpFindData = async (username, passwordEnteredByUser) => {
  let result;
  let data = await UserSignUp.find({ email: username });
  if (data.length === 0) {
    return 2;
  }

  const hashedPasswordFromDB = data[0].password;
  const match = await bcrypt.compare(
    passwordEnteredByUser,
    hashedPasswordFromDB
  );
  result = match ? 6 : 5;
  return result;
};

module.exports = {
  createNewUser,
  isValidUser,
  UserSignUp,
};
