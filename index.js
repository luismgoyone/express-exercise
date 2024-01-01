const express = require('express');
const dotenv = require('dotenv').config();

const userRoutes = require('./src/users/routes');
const postRoutes = require('./src/posts/routes');

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use('/api/v1/users', userRoutes);

app.use('/api/v1/posts', postRoutes);

app.listen(port, () => {
  console.log('server started listening to port ' + port);
});
