const { assert } = require("chai");
// const { expect } = require("chai");

const { getUserByEmail } = require("../helpers.js");

console.log("getUserByEmail", getUserByEmail);

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(user, expectedUserID);
  });
  it("should return undefined if email is not in users database", function () {
    const user = getUserByEmail("dummy@example.com", testUsers);
    // const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.isUndefined(user);
  });
});
