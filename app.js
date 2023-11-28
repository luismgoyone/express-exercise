const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.EXPRESS_PORT || 3000;

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse application/json
app.use(express.json());

const db = require('./db/dbClient');

// Middleware
// ...

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.post('/create-user', async (req, res) => {
  const {
    first_name,
    last_name,
  } = req.body;

  const errors = [];

  // TODO: Maybe refactor using express-validator
  if (!first_name) {
    errors.push({ message: 'Parsed falsy value for param "first_name"' });
  } else if (typeof last_name !== 'string') {
    errors.push({ message: 'Value for param "first_name" should be of type "string"' });
  } else if (
    !first_name.length ||
    first_name.length > 20
  ) {
    errors.push({ message: 'String "first_name" should have a length of 1 up to 20 characters' });
  }

  if (!last_name) {
    errors.push({ message: 'Parsed falsy value for param "last_name"' });
  } else if (typeof last_name !== 'string') {
    errors.push({ message: 'Value for param "last_name" should be of type "string"' });
  } else if (
    !last_name.length ||
    last_name.length > 20
  ) {
    errors.push({ message: 'String "last_name" should have a length of 1 up to 20 characters' });
  }

  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  const result = await db('users')
    .insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
    })
    .returning('*');

  res.json(result);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
