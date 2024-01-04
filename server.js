const app = require('./app');
const port = process.env.EXPRESS_PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = server;
