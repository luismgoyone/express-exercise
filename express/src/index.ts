import express from 'express';
import * as db from './db';

const app = express();
const port = process.env.PORT;

app.get('/', (_, res) => {
  res.send('Server up.');
});

const server = app.listen(port, async () => {
  try {
    const dbInitialized = await db.init();
    if (!dbInitialized) {
      server.close((error) => {
        console.error('[server]: Server closing...');
        process.exit(error ? 1 : 0);
      })
    };

    console.info(`[server]: Server running at http://localhost:${port}`)
  } catch(error) {
    console.error('[server]: Error opening server connection');
    return;
  }  
});