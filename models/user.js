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
      `INSERT INTO users (username, password, first_name, last_name, 
        phone, join_at, last_login_at)
          VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
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
      if ((await bcrypt.compare(password, userPassword)) === true) {
        return true;
      }
    }

    return false;

    // TODO: Do we need an error along with the boolean?
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
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
    const result = await db.query(
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

  static async messagesFrom(username) {
    const messageResult = await db.query(
      `SELECT m.id, m.to_username, m.body, m.sent_at, 
      m.read_at, u.username, u.first_name, u.last_name, u.phone
      FROM messages AS m JOIN users AS u ON m.to_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );
    const messages = messageResult.rows;
    console.log(`MESSAGE RESULTS: ${messages}`);


    const messagesFrom = [];

    for (let message of messages) {
      const returnObj = {
        id : message.id,
        to_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone,
        },
        body : message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
      }

      messagesFrom.push(returnObj);
    }

    console.log("MESSAGES FROM", messagesFrom)

    return messagesFrom;


    // const fromMessages = messages.map((r) => {
    //   const returnObject = {
    //     id: messages.id,
    //     to_user: {
    //       username: to_users.username,
    //       first_name: to_users.first_name,
    //       last_name: to_users.last_name,
    //       phone: to_users.phone,
    //     },
    //     body: messages.body,
    //     sent_at: messages.sent_at,
    //     read_at: messages.read_at,
    //   };
    //   return returnObject;
    // });
    // return fromMessages;
    // TODO: Come back to this after initial data entry routes are done
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    
    const messageResult = await db.query(
      `SELECT m.id, m.from_username, m.body, m.sent_at, 
      m.read_at, u.username, u.first_name, u.last_name, u.phone
      FROM messages AS m JOIN users AS u ON m.from_username = u.username
      WHERE m.to_username = $1`,
      [username]
    );
    const messages = messageResult.rows;
    console.log(`MESSAGE RESULTS: ${messages}`);


    const messagesTo = [];

    for (let message of messages) {
      const returnObj = {
        id : message.id,
        from_user: {
          username: message.username,
          first_name: message.first_name,
          last_name: message.last_name,
          phone: message.phone,
        },
        body : message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
      }

      messagesTo.push(returnObj);
    }

    console.log("MESSAGES TO", messagesTo)

    return messagesTo;



  }
}

module.exports = User;
