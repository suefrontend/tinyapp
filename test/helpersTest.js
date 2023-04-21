const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

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
const testURLs = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
  J0y1irv: {
    longURL: "http://test05.com",
    userID: "userRandomID",
  },
  tANiLG1: {
    longURL: "http://test.com",
    userID: "user2RandomID",
  },
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it("should return undefined if email is not in users database", function() {
    const user = getUserByEmail("dummy@example.com", testUsers);
    assert.isUndefined(user);
  });
});

describe("urlsForUser", function() {
  it("should return the URLs where the userID is equal to the id of the currently logged-in user", function() {
    const urls = urlsForUser("userRandomID", testURLs);
    const expectedURLs = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
      J0y1irv: { longURL: "http://test05.com", userID: "userRandomID" },
    };
    assert.deepEqual(urls, expectedURLs);
  });
});
