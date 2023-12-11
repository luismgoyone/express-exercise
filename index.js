const express = require('express');
const userRoutes = require('./src/users/routes');
const app = express();
const port = 3000;

app.use(express.json());

app.use('/api/v1/user', userRoutes);

app.listen(port, () => {
  console.log('server started');
});
