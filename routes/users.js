const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const knex = require('../db/dbClient');
const { verifyAuthToken } = require('../utils/verifyAuth');

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
    return res.status(400).json({ errors });
  }

  const {
    first_name,
    last_name,
    username,
    password,
  } = req.body;

  const [returnedUser] = await knex('users')
    .insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
    })
    .returning('*');

  const [returnedUserLogin] = await knex('user_logins')
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
  // TODO: Wrap db operations in a try-catch block [?]

  const {
    username,
    password,
  } = req.body;

  const [userLoginRecordByUsername] = await knex('user_logins')
    .where({ username })
    .select('username')
    .from('user_logins')
    .returning('*');

  console.log({ userLoginRecordByUsername });
  
  // validations against records

  // if username doesn't exist, return an error
  if (!userLoginRecordByUsername) {
    return res.status(400).send({ error: `User ${username} not found` });
  }

  const [userLoginMatchingRecord] = await knex('user_logins')
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
    return res.status(400).send({ error: `Incorrect username or password` });
  }

  // TODO: Invalidate previous token (if there's any) [?]
  // TODO: Set expiration logic for new token [?]
  const newLoginToken = jwt.sign(
    {
      username: userLoginMatchingRecord.username,
      user_id: userLoginMatchingRecord.user_id,
    },
    AUTH_SECRET
  );

  console.log({ newLoginToken });

  const [updatedUserLoginRecord] = await knex('user_logins')
    .where({
      username,
      password,
    })
    .update({
      token: newLoginToken,
      last_login_at: knex.fn.now(),
    }, ['username', 'token']);

  console.log({ updatedUserLoginRecord });

  // retrieve record from DB (USE JOIN)
  const [userAndUserLoginRecord] = await knex('users')
    .join('user_logins', 'users.id', '=', 'user_logins.user_id')
    .select(
      'users.id',
      'users.first_name',
      'users.last_name',
      'user_logins.username',
      'user_logins.token'
    );

  console.log({ userAndUserLoginRecord });
  
  // return user record (USE JOIN)
  res.json(userAndUserLoginRecord);
});

router.post('/logout', async (req, res) => {
  const authorizationHeader = req.headers['Authorization'] || req.headers['authorization'];

  if (!authorizationHeader) {
    return res.status(401).json({ message: 'No `authorization` header provided' });
  }

  const {
    isValid,
    decodedData,
  } = verifyAuthToken(authorizationHeader);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!decodedData) {
    return res.status(401).json({ message: 'Invalid decoded data' });
  }

  const { user_id } = decodedData;

  const [updatedUserLoginRecord] = await knex('user_logins')
    .where({ user_id })
    .update(
      { token: null },
      ['user_id', 'username']
    );

  if (!updatedUserLoginRecord) {
    return res.status(401).json({ message: 'Logout failed' });
  }

  res.json({ success: true });
});

module.exports = router;
