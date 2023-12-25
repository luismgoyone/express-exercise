import express from 'express';

const app = express();
const port = process.env.PORT;

app.get('/', (_, res) => {
  res.send('Server up.');
});

app.listen(port, () => {
  console.info(`[express]: Server running at http://localhost:${port}`)
});