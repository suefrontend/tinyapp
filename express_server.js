const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
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

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

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
    console.log("user", user);
    console.log("users", users);
    if (users[user].email === input) {
      foundUser = users[user];
    }
  }
  return foundUser;
};

// returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id) => {
  const filteredUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      filteredUrls[key] = urlDatabase[key];
    }
  }
  return filteredUrls;
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
  // If not logged in,
  // Show message: log in or register first
  // console.log("urlDatabase", urlDatabase);

  const templateVars = {
    id: req.cookies.user_id,
    user: "",
    urls: "",
    message: "",
    params: req.cookies.user_id,
  };

  if (!req.cookies.user_id) {
    templateVars.message = "Please login or register to see URLs";
  }

  if (req.cookies.user_id) {
    const currentUserURL = urlsForUser(req.cookies.user_id);

    templateVars.user = users[req.cookies.user_id];
    templateVars.urls = currentUserURL; // -> Real data
    // templateVars.urls = urlDatabase; // Temporary display all data
  }
  console.log("users", users);
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
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const currentUser = getUserByEmail(email);
  // const getUserByEmail = (input) => {
  //   let foundUser = null;

  //   for (const user in users) {
  //     if (users[user].email === input) {
  //       foundUser = users[user];
  //     }
  //   }
  //   return foundUser;
  // };
  console.log("currentUser", currentUser);

  if (!email || !password) {
    res.status(400).send("Please fill out all fields");
  }

  if (!currentUser) {
    res.status(403).send("Can't find the email");
  }

  const validPassword = bcrypt.compareSync(password, hashedPassword);

  // if (currentUser.email === email && currentUser.password !== password) {
  //   res.status(403).send("Password doen't match");
  // }

  if (validPassword && currentUser.email === email) {
    console.log("OK");
  }

  res.cookie("user_id", currentUser.id);
  res.redirect("/urls");
});

//*******************
// Logout - POST
//*******************

app.post("/logout", (req, res) => {
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
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
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
    hashedPassword,
  };

  users[id] = newUser;
  res.cookie("user_id", id);
  console.log("New Cookie!:", req.cookies.user_id);
  res.redirect("/urls");
});

//*******************
// Add URL - POST
//*******************

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.status(400).send("You must login to create a short URL");
  }

  if (req.cookies.user_id && req.body.longURL) {
    const id = generateRandomString();

    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id,
    };

    res.redirect(`/u/${id}`);
  }
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
    url: urlDatabase[req.params.id],
  };

  res.render("urls_show", templateVars);
});

// Cookie中のユーザーのアイテムのみをフィルター
// const urlsForUser = (id) => {
//   const filteredUrls = {};
//   for (const key in urlDatabase) {
//     if (urlDatabase[key].userID === id) {
//       filteredUrls[key] = urlDatabase[key];
//     }
//   }
//   return filteredUrls;
// };

app.get("/urls/:id", (req, res) => {
  const currentUser = req.cookies.user_id; //
  const itemToEdit = req.params.id;

  if (!urlDatabase[itemToEdit]) {
    return res.status(400).send("The URL doesn't exist.");
  }

  // If not loggin error message
  if (!currentUser) {
    return res.status(400).send("You must login to access to this page.");
  }

  const urlOwner = urlDatabase[itemToEdit].userID; // aJ48lW
  if (urlOwner !== currentUser) {
    return res.status(403).send("You DONT have access to delete this.");
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
  const currentUser = req.cookies.user_id; //
  const itemToDelete = req.params.id;
  const urlOwner = urlDatabase[itemToDelete].userID; // aJ48lW

  if (!currentUser) {
    return res.status(403).send("You must login.");
  }

  if (urlOwner !== currentUser) {
    return res.status(403).send("You DONT have access to delete this.");
  }

  delete urlDatabase[itemToDelete];

  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
