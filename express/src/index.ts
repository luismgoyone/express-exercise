import express from 'express';

const app = express();
const port = process.env.PORT;

app.get('/', (_, res) => {
  res.send('server is up...');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
});