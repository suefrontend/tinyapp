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

module.exports = { getUserByEmail };
