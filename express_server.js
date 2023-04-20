const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//*******************
// Middlewares
//*******************

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Original data
// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };

const users = {
  1: {
    id: "1",
    email: "1@example.com",
    password: "123",
  },
  2: {
    id: "2",
    email: "2@example.com",
    password: "123",
  },
};

//*******************
// Generate String
//*******************

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
// Find User by Email
//*******************

const getUserByEmail = (input) => {
  let foundUser = null;

  for (const user in users) {
    if (users[user].email === input) {
      foundUser = users[user];
    }
  }
  return foundUser;
};

//*******************
// Home Page
//*******************

app.get("/", (req, res) => {
  res.redirect("/urls");
});

//*******************
// My URLs Page
//*******************

app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//*******************
// Login Page
//*******************

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render("user_login", templateVars);
});

//*******************
// Login - POST
//*******************

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentUser = getUserByEmail(email);

  if (!email || !password) {
    res.status(400).send("Please fill out all fields");
  }

  if (!currentUser) {
    res.status(403).send("Can't find the email");
  }

  if (currentUser.email === email && currentUser.password !== password) {
    res.status(403).send("Password doen't match");
  }

  res.cookie("user_id", currentUser.id);
  res.redirect("/urls");
});

//*******************
// Logout - POST
//*******************

app.post("/logout", (req, res) => {
  console.log("req.cookies.user_id", req.cookies.user_id);
  res.clearCookie("user_id");
  res.redirect("/login");
});

//*******************
// Register Page
//*******************

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("user_register", templateVars);
});

//*******************
// Register - POST
//*******************

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentUser = getUserByEmail(email);

  if (!email || !password) {
    return res.status(400).send("Please fill out all fields");
  }

  if (currentUser && currentUser.email === email) {
    return res.status(400).send("User already exist");
  }

  const id = generateRandomString();

  const newUser = {
    id,
    email,
    password,
  };

  users[id] = newUser;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//*******************
// Add URL - POST
//*******************

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(400).send("You must login to create a short URL");
  }

  if (req.cookies.user_id) {
    const id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/u/${id}`);
  }

  console.log("urldatabase", urlDatabase);
});

//*******************
// Add URL Page
//*******************

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

//*******************
// Sinle URL Page
//*******************

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("The URL doesn't exist.");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };

  res.render("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("The URL doesn't exist.");
  }

  const templateVars = {
    user: users[req.cookies.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

//*******************
// Edit URL - POST
//*******************

app.post("/urls/:id", (req, res) => {
  // Update urlDatabase
  urlDatabase[req.params.id] = req.body.updatedURL;
  res.redirect("/urls");
});

//*******************
// Delete URL - POST
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
