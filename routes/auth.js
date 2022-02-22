"use strict";

const User = require("../models/user");

const { UnauthorizedError, BadRequestError } = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res) {
  const { username, password } = req.body;

  if (await User.authenticate(username, password)) {
    const token = jwt.sign({ username }, SECRET_KEY);

    return res.json({ token });
  }

  throw new UnauthorizedError();
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res) {

  const { username, password, first_name, last_name, phone } = req.body;
//   console.log("REQ.BODY: ", req.body);
//   console.log("USERINFO: ", userInfo);
  const response = await User.register(req.body);
  console.log("RES: ", response);
  if (response) {
    const token = jwt.sign({ username }, SECRET_KEY);
    console.log("TOKEN USER ", token);
    return res.json({ token }); 
  }
  throw new BadRequestError();
});

module.exports = router;
