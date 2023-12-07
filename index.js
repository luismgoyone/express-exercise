const express = require('express');
const userRoutes = require('./src/users/routes');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (request, response) => {
  response.send('Hello World');
});

app.use('/api/v1', userRoutes);

app.listen(port, () => {
  console.log('server started');
});
