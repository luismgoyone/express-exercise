const express = require('express');
const app = express();
require('dotenv').config();

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse application/json
app.use(express.json());

// Middleware
// ...

app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

module.exports = app;
