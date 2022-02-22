"use strict";

const User = require("../models/user");

const { UnauthorizedError } = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function () {

    const { username, password } = req.body;


    if (User.authenticate(username, password)) {
        const token = jwt.sign({ username }, SECRET_KEY);
        console.log("HERE IS THE TOKEN",token);
        return res.json({token});
    };


    throw new UnauthorizedError;

});




/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function () {

    const { username, password, first_name, last_name, phone } = req.body;

})


module.exports = router;