"use strict";

const Message = require("../models/message");

const Router = require("express").Router;
const router = new Router();





router.post('/create', async function(req, res){


    const {from_username, to_username, body} = req.body;

    const newMessage = await Message.create({from_username, to_username, body});

    return res.json(newMessage);
})
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/


module.exports = router;