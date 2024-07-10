const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const connectDb = require("./config/dbConnection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorHandler = require("./middleware/errorHandler");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());
app.use(errorHandler);

// MongoDB connection
connectDb();

// Schemas
const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  number: String,
  password: {
    type: String,
    required: true,
    min: 3,
    max: 12,
  },
  confirmPassword: String,
});

const wagerSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  address: String,
  District: String,
  state: String,
  pincode: String,
  NumberofWager: String,
  work: String,
  contactNo: String,
});

const agriSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  contactNo: String,
  address: String,
  District: String,
  state: String,
  pincode: String,
  machine: String,
});

const userModel = mongoose.model("User", userSchema);
const wagerModel = mongoose.model("Wager", wagerSchema);
const agriModel = mongoose.model("Agri", agriSchema);

// Routes
app.post("/signup", async (req, res) => {
  const { firstname, lastname, email, number, password, confirmPassword } =
    req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

  try {
    const oldUser = await userModel.findOne({ email });
    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await userModel.create({
      firstname,
      lastname,
      email,
      number,
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ error: "User not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET);
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "Invalid Password" });
    }
  } catch (error) {
    res.json({ status: "error", error: error.message });
  }
});

app.post("/wagers", async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    contactNo,
    address,
    District,
    state,
    pincode,
    NumberofWager,
    work,
  } = req.body;
  try {
    const oldUser = await wagerModel.findOne({ email });
    if (oldUser) {
      return res.json({ error: "User request already Exists" });
    }
    await wagerModel.create({
      firstname,
      lastname,
      email,
      contactNo,
      address,
      District,
      state,
      pincode,
      NumberofWager,
      work,
    });
    res.send({ status: "request created successfully" });
  } catch (error) {
    res.send({ status: "error", error: error.message });
  }
});

app.post("/agris", async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    contactNo,
    address,
    District,
    state,
    pincode,
    machine,
  } = req.body;
  try {
    const oldUser = await agriModel.findOne({ email });
    if (oldUser) {
      return res.json({ error: "User request already Exists" });
    }
    await agriModel.create({
      firstname,
      lastname,
      email,
      contactNo,
      address,
      District,
      state,
      pincode,
      machine,
    });
    res.send({ status: "request created successfully" });
  } catch (error) {
    res.send({ status: "error", error: error.message });
  }
});

app.post("/profile", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findOne({ email: decoded.email });
    res.send({ status: "ok", data: user });
  } catch (error) {
    res.send({ status: "error", error: error.message });
  }
});

app.get("/getagriuser", async (req, res) => {
  try {
    const allAgriUsers = await agriModel.find({});
    res.send({ status: "ok", data: allAgriUsers });
  } catch (error) {
    res.send({ status: "error", error: error.message });
  }
});

app.get("/getwageruser", async (req, res) => {
  try {
    const allWagerUsers = await wagerModel.find({});
    res.send({ status: "ok", data: allWagerUsers });
  } catch (error) {
    res.send({ status: "error", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
