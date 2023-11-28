const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.EXPRESS_PORT || 3000;

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse application/json
app.use(express.json());

// Middleware
// ...

const db = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.post('/insert-user', async (req, res) => {
  // TODO: Implement

  // Example code
  /*
  const result = await db('users')
    .insert({
      first_name: 'foo',
      last_name: 'bar',
    })
    .returning('*');
  console.log({ result });

  res.json(result);
  */
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
