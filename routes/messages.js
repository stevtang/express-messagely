"use strict";

const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const Message = require("../models/message");
const { UnauthorizedError } = require("../expressError");

const Router = require("express").Router;
const router = new Router();

router.post("/create", async function (req, res) {
  const { from_username, to_username, body } = req.body;

  const newMessage = await Message.create({ from_username, to_username, body });

  return res.json(newMessage);
});

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

router.post("/:id", ensureLoggedIn, async function (req, res) {
  const id = req.params.id;

  const message = await Message.get(id);

  if (
    res.locals.user.username != message.to_user.username &&
    message.from_user.username
  ) {
    throw new UnauthorizedError();
  }

  return res.json({ message });
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res) {
  const { to_username, body } = req.body;

  const from_username = res.locals.user.username;

  const message = await Message.create({ from_username, to_username, body });

  return res.json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res) {
  const id = req.params.id;
  const messageInfo = await Message.get(id);
  if (res.locals.user.username !== messageInfo.to_user.username) {
    throw new UnauthorizedError();
  } else {
    const message = await Message.markRead(id);
    return res.json({ message });
  }
});

module.exports = router;
