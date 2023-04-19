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
// Check Email Exist
//*******************

// getUserByEmail(req.body.email, id);

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
  console.log("users", users);
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//*******************
// Login - POST
//*******************

app.post("/login", (req, res) => {
  // TODO: change username
  // res.cookie("username", req.body.username);
  res.redirect("/urls");
});

//*******************
// Logout - POST
//*******************

app.post("/logout", (req, res) => {
  console.log("req.cookies.user_id", req.cookies.user_id);
  res.clearCookie(req.cookies.user_id);
  res.redirect("/urls");
});

//*******************
// Register Page
//*******************

app.get("/register", (req, res) => {
  res.render("user_register");
});

//*******************
// Register - POST
//*******************

const getUserByEmail = (newUser) => {
  for (const user in users) {
    const currentUser = users[user].email;

    if (currentUser === newUser) {
      return true;
    }
  }
  return false;
};

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    const id = generateRandomString();

    const newUser = {
      id,
      email: req.body.email,
      password: req.body.password,
    };

    const userExist = getUserByEmail(req.body.email);

    if (userExist) {
      res.status(400);
      res.send("User already exist");
    }

    users[id] = newUser;
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send("Please fill out all fields");
  }
});

//*******************
// Add URL - POST
//*******************

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/u/${id}`);
});

//*******************
// Add URL Page
//*******************

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

//*******************
// Sinle URL Page
//*******************

app.get("/u/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
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
