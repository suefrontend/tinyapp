const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

//*******************
// Middlewares
//*******************

app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "user_id",
    keys: ["key"],
  })
);

//*******************
// URL Data
//*******************

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "sgq3y6",
  },
  J0y1irv: {
    longURL: "http://test05.com",
    userID: "aJ48lW",
  },
  tANiLG1: {
    longURL: "http://test.com",
    userID: "sgq3y6",
  },
};

//*******************
// Users Data
//*******************

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "1@example.com",
    password: "$2a$10$EhVbkPtEQgCqwHQYq6VkfuEl2nPgvjaJmKlSrFrcTCQd2UR883SDa", // 123
  },
  sgq3y6: {
    id: "sgq3y6",
    email: "2@example.com",
    password: "$2a$10$Fiv3AgbWDsAciU3gPXKaKeB6uVP0m.UZbsl1GbrGrHaXDPW7Z3zMa", // 456
  },
};

//*******************
// Home Page - GET
//*******************

app.get("/", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//*******************
// My URLs - GET
//*******************

app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  const templateVars = {
    id: userId,
    user: "",
    urls: "",
    message: "",
    params: userId,
  };

  // Detect invalid session
  if (!users[userId]) {
    req.session = null;
    return res.redirect("/register");
  }

  if (!userId) {
    templateVars.message = "Please login or register to see URLs";
  }

  if (userId) {
    const currentUserURL = urlsForUser(userId, urlDatabase);
    console.log("currentUserURL", currentUserURL);

    templateVars.user = users[userId];
    templateVars.urls = currentUserURL;
  }
  res.render("urls_index", templateVars);
});

//*******************
// Login - GET
//*******************

app.get("/login", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[userId],
    urls: urlDatabase,
  };
  res.render("user_login", templateVars);
});

//*******************
// Login - POST
//*******************

app.post("/login", (req, res) => {
  const email = req.body.email;
  const enteredPassword = req.body.password;

  if (!email || !enteredPassword) {
    return res.status(400).send("Please fill out all fields");
  }

  const currentUser = getUserByEmail(email, users); // found user by email
  if (!currentUser) {
    return res.status(403).send("Can't find the email");
  }

  const validPassword = bcrypt.compareSync(
    enteredPassword, // Password entered
    currentUser.password // password saved in database (hashed password)
  );

  if (!validPassword) {
    return res.status(403).send("Password doesn't match");
  }

  req.session.userId = currentUser.id;
  res.redirect("/urls");
});

//*******************
// Logout - POST
//*******************

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//*******************
// Register - GET
//*******************

app.get("/register", (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    res.redirect("/urls");
  }

  const templateVars = {
    user: users[userId],
  };
  res.render("user_register", templateVars);
});

//*******************
// Register - POST
//*******************

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please fill out all fields");
  }

  const currentUser = getUserByEmail(email, users);

  if (currentUser && currentUser.email === email) {
    return res.status(400).send("User already exist");
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id,
    email,
    password: hashedPassword,
  };

  users[id] = newUser;
  req.session.userId = id;
  res.redirect("/urls");
});

//*******************
// Create URL - POST
//*******************

app.post("/urls", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(400).send("You must login to create a short URL");
  }

  if (userId && req.body.longURL) {
    const id = generateRandomString();

    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: userId,
    };

    res.redirect(`/urls/${id}`);
  }
});

//*******************
// Create URL - GET
//*******************

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.redirect("/login");
  }

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});

//*******************
// URL Redirect - GET
//*******************

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURLObj = urlDatabase[shortURL];

  if (!longURLObj) {
    return res.status(400).send("The URL doesn't exist.");
  }

  res.redirect(longURLObj.longURL);
});

//*******************
// Short URL - GET
//*******************

app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;

  const currentUser = userId;
  const itemToEdit = req.params.id;

  if (!urlDatabase[itemToEdit]) {
    return res.status(400).send("The URL doesn't exist.");
  }

  if (!currentUser) {
    return res.status(400).send("You must login to access to this page.");
  }

  const urlOwner = urlDatabase[itemToEdit].userID;
  if (urlOwner !== currentUser) {
    return res.status(403).send("You don't have access to edit this URL.");
  }

  const templateVars = {
    user: users[currentUser],
    id: itemToEdit,
    url: urlDatabase[itemToEdit],
  };
  res.render("urls_show", templateVars);
});

//*******************
// Edit URL - POST
//*******************

app.post("/urls/:id", (req, res) => {
  const itemToEdit = urlDatabase[req.params.id];

  itemToEdit.longURL = req.body.updatedURL;
  res.redirect("/urls");
});

//*******************
// Delete URL - POST
//*******************

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;

  const currentUser = userId; //
  const itemToDelete = req.params.id;
  const urlOwner = urlDatabase[itemToDelete].userID;

  if (!currentUser) {
    return res.status(403).send("You must login.");
  }

  if (urlOwner !== currentUser) {
    return res.status(403).send("You don't have access to delete this.");
  }

  delete urlDatabase[itemToDelete];

  res.redirect("/urls");
});

//*******************
// Start App
//*******************

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
