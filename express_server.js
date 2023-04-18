const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//*******************
// Display Home Page
//*******************

app.get("/", (req, res) => {
  res.send("Hello!");
});

//*******************
// Display URL List
//*******************

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//*******************
// Add New URL
//*******************

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/u/${id}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//*******************
// Display Sinle URL
//*******************

app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  if (!urlDatabase[req.params.id]) {
    res.send("The URL doesn't exist.");
  }
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

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

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
