const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const db = require('../db/dbClient');

const validationsRegisterEndpoint = ['first_name', 'last_name', 'username', 'password'].map(field => {
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

router.post('login', async (req, res) => {
  // TODO: Implement
});

router.post('logout', async (req, res) => {
  // TODO: Implement
});

module.exports = router;
