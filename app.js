const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.EXPRESS_PORT || 3000;

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse application/json
app.use(express.json());

const knex = require('./db/dbClient');

// Middleware
// ...

app.use('/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.get('/posts', (req, res) => {
  // WIP
  let error = null;

  // NOTE: Just an example code for creating a table via the knex.schema API
  // TODO: Relocate to a JS file for schema-related functionalities
  knex.schema.hasTable('posts')
    .then((exists) => {
      if (exists) {
        console.info('table `posts` already exists');
        return;
      }

      return knex.schema.createTable('posts', (t) => {
        t.integer('user_id').unsigned().references('id').inTable('users');
        t.text('content').defaultTo(null);
        t.timestamp('created_at', knex.fn.now());
      });
    })
    .catch((err) => {
      const message = 'Error creating table `posts`:' + err.message;
      console.error(message);
      error = { message };
    })
    .finally(() => {
      knex.destroy();
    });

  if (error) {
    return res.status(500).json(error);
  }

  res.json({ message: '`posts` table now ready' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
