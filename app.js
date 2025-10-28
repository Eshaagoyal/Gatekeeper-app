
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const session = require("express-session");

const app = express();
const USERS_FILE = "./users.json";

// Middleware setup
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "codeacademy-secret-key",
  resave: false,
  saveUninitialized: false
}));

// Utility functions
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Routes
app.get("/", (req, res) => {
  if (req.session.user) return res.send(`<h2>Welcome ${req.session.user.username}! 🎉</h2><a href='/logout'>Logout</a>`);
  res.redirect("/login");
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.render("signup", { error: "Username already exists!" });
  }

  const newUser = {
    id: uuidv4(),
    username,
    password
  };
  users.push(newUser);
  writeUsers(users);
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.render("login", { error: "Invalid credentials!" });
  }

  req.session.user = user;
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// Start server
app.listen(3000, () => console.log("🚀 Gatekeeper running on http://localhost:3000"));
