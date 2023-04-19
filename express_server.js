const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter <= 6) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

//*******************
// URL Data
//*******************

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//*******************
// Users Data
//*******************

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//*******************
// Home Page
//*******************

app.get("/", (req, res) => {
  res.send("Hello!");
});

//*******************
// My URLs
//*******************

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//*******************
// Login
//*******************

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//*******************
// Logout
//*******************

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//*******************
// Create Account
//*******************

app.get("/register", (req, res) => {
  res.render("user_register");
});

//*******************
// Create New URL
//*******************

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/u/${id}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies["username"] });
});

//*******************
// Sinle URL
//*******************

app.get("/u/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  if (!urlDatabase[req.params.id]) {
    res.send("The URL doesn't exist.");
  }
  res.render("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  console.log("req", req);

  const templateVars = {
    username: req.cookies["username"],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

//*******************
// Edit URL
//*******************

app.post("/urls/:id", (req, res) => {
  // Update urlDatabase
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect("/urls");
});

//*******************
// Delete URL
//*******************

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
