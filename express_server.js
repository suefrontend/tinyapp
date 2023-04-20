const express = require("express");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//*******************
// Middlewares
//*******************

app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(
  cookieSession({
    name: "user_id",
    keys: ["key"],
  })
);

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
  const userId = req.session.userId;

  const templateVars = {
    id: userId,
    user: "",
    urls: "",
    message: "",
    params: userId,
  };

  if (!userId) {
    templateVars.message = "Please login or register to see URLs";
  }

  if (userId) {
    const currentUserURL = urlsForUser(userId);

    templateVars.user = users[userId];
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

  // res.cookie("user_id", currentUser.id);
  req.session.userId = currentUser.id;
  res.redirect("/urls");
});

//*******************
// Logout - POST
//*******************

app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/login");
});

//*******************
// Register Page
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
  // res.cookie("user_id", id);
  req.session.userId = id;
  console.log("New Cookie!:", req.session.userId);
  res.redirect("/urls");
});

//*******************
// Add URL - POST
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

    res.redirect(`/u/${id}`);
  }
});

//*******************
// Add URL Page
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
// Sinle URL Page
//*******************

app.get("/u/:id", (req, res) => {
  const userId = req.session.userId;

  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("The URL doesn't exist.");
  }

  const templateVars = {
    user: users[userId],
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
  const userId = req.session.userId;

  const currentUser = userId; //
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
  const userId = req.session.userId;

  const currentUser = userId; //
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
