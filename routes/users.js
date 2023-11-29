const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const db = require('../db/dbClient');

require('dotenv').config();
const { AUTH_SECRET } = process.env;

function validateStringUserParam(field) {
  return body(field)
    .exists()
    .withMessage(`${field} is required`)
    .isString()
    .withMessage(`${field} must be a string`)
    .isLength({
      min: (field === 'password' ? 8 : 1),
      max: 20,
    })
    .withMessage(`String ${field} should have a length of 1 up to 20 characters`);
}

const validationsRegisterEndpoint = ['first_name', 'last_name', 'username', 'password'].map(field => {
  return validateStringUserParam(field);
});

router.post('/register', validationsRegisterEndpoint, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({ errors });
    return;
  }

  const {
    first_name,
    last_name,
    username,
    password,
  } = req.body;

  const [returnedUser] = await db('users')
    .insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
    })
    .returning('*');

  const [returnedUserLogin] = await db('user_logins')
    .insert({
      user_id: returnedUser.id,
      username: username.trim(),
      password: password,
    })
    .returning('*');

  console.log(JSON.stringify({
    returnedUser,
    returnedUserLogin,
  }, null, 2));

  res.json({
    id: returnedUser.id,
    first_name: returnedUser.first_name,
    last_name: returnedUser.last_name,
    username: returnedUserLogin.username,
  });
});

router.post('/login', async (req, res) => {
  // TODO: Implement

  const {
    username,
    password,
  } = req.body;

  const [userLoginRecordByUsername] = await db('user_logins')
    .where({ username })
    .select('username')
    .from('user_logins')
    .returning('*');

  console.log({ userLoginRecordByUsername });

  res.send({ userLoginRecordByUsername })
  
  // validations against records

  // if username doesn't exist, return an error
  if (!userLoginRecordByUsername) {
    res.status(400).send({ error: `User ${username} not found` });
    return;
  }

  const [userLoginMatchingRecord] = await db('user_logins')
    .where({
      username,
      password,
    })
    .select('username', 'user_id')
    .from('user_logins')
    .returning('*');
  
    console.log({ userLoginMatchingRecord });

  // if username and password combination is invalid, return an error
  if (
    userLoginRecordByUsername &&
    !userLoginMatchingRecord
  ) {
    res.status(400).send({ error: `Incorrect username or password` });
    return;
  }

  const newLoginToken = jwt.sign(
    {
      username: userLoginMatchingRecord.username,
      user_id: userLoginMatchingRecord.user_id,
    },
    AUTH_SECRET
  );

  console.log({ newLoginToken });

  // TODO: set token on user_login record [?]

  // TODO: retrieve record from DB (USE JOIN)
  
  // TODO: return user record (USE JOIN)
});

router.post('/logout', async (req, res) => {
  // TODO: Implement
});

module.exports = router;
