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

app.use('/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
