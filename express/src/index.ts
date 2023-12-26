import express from 'express';
import * as db from './db';

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[server | ${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(req.body)
  next();
});

app.get('/api', (_, res) => {
  res.send('Server up.');
});

app.post('/api/users', (req, res) => {
  
  const nonExistentUser = {
    id: 666,
    first_name: 'sukuna',
    last_name: 'ryomen',
    username: 'malevolent',
    password: 'shrine666'
  }

  const existingUser = {
    id: 1,
    first_name: 'gojo',
    last_name: 'satoru',
    username: 'limitless',
    password: 'sixeyes',
  }

  const { id, ...userDetails } = existingUser

  const isUserExisting = JSON.stringify(req.body) === JSON.stringify(userDetails)
  if (isUserExisting) {
    res.status(409).json({
      success: false,
      error: 'User already exists!'
    })    
    return;
  }

  const isPasswordLessThan8Characters = req.body.password.length < 8
  if (isPasswordLessThan8Characters) {
    res.status(400).json({
      success: false,
      error: 'Password should be 8 characters or above!'
    })    
    return;
  }

  res.status(201).json({
    success: true,
    data: nonExistentUser,
  })
})

const server = app.listen(port, async () => {
  try {
    const dbInitialized = await db.init();
    if (!dbInitialized) {
      server.close((error) => {
        console.error('[server]: Server closing...');
        process.exit(error ? 1 : 0);
      })
    };

    console.info(`[server]: Server running at http://localhost:${port}/api`)
  } catch(error) {
    console.error('[server]: Error opening server connection');
    return;
  }  
});