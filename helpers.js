//*******************
// Find User by Email
//*******************

const getUserByEmail = (input, data) => {
  let foundUser = undefined;

  for (const user in data) {
    // console.log("user", user);
    // console.log("data", data);
    if (data[user].email === input) {
      foundUser = data[user];
    }
  }
  return foundUser;
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
// Find URLs by user
//*******************

// returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id, data) => {
  const filteredUrls = {};
  for (const key in data) {
    if (data[key].userID === id) {
      filteredUrls[key] = data[key];
    }
  }
  return filteredUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
