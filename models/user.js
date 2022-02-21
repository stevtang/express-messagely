"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR } = require("../config");
const res = require("express/lib/response");

/** User of the site. */

class User {
  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]
    );

    const userPassword = result.rows[0];

    if (userPassword) {

      if (await bcrypt.compare(password, userPassword) === true) {

        return true;
      }
    }

    return false;

    // TODO: Do we need an error along with the boolean?
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 


    const result = db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username`,
      [username]
    );

    const user = result.rows[0];

    // TODO: Do we need a return value from this?

    if (!user) throw new NotFoundError(`No such user: ${username}`);

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() { 

    const result = db.query(
      `SELECT username, first_name, last_name
      FROM users`
    );

    const users = results.rows;

    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const result = db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );

   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */


  // User.messagesFrom("sam")

  static async messagesFrom(username) {

    const messageResult = db.query(
      `SELECT id, to_user, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1`,
      [username]
    );

    const messages = messageResult.rows;


    // TODO: Write a map to get the toUser from each result row
    // TODO: SELECT for each toUser to get the user data
    // TODO: join the results from each



   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}

module.exports = User;
