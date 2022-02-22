"use strict";

const db = require("../db");
const User = require("../models/user");

const Router = require("express").Router;
const router = new Router();


router.post('/register', async function(req, res){
    const {username, password, first_name, last_name, phone} = req.body;

    const newUser = await User.register({username, password, first_name, last_name, phone});

    return res.json(newUser);
})

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

module.exports = router;