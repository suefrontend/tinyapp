// Find User by Email
const getUserByEmail = (input, data) => {
  let foundUser = undefined;

  for (const user in data) {
    if (data[user].email === input) {
      foundUser = data[user];
    }
  }
  return foundUser;
};

// Generate String
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

// Find URLs by user
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
