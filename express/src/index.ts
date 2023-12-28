import express from 'express';
import * as db from './db';

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
      error: 'Password should be 8 characters or above!',
    })    
    return;
  }

  res.status(201).json({
    success: true,
    data: nonExistentUser,
  })
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const nonExistentUsername = 'panda'
  const isUserExisting = username !== nonExistentUsername
  
  const isUserMatching = username === existingUser.username && password === existingUser.password  

  if (!isUserExisting || !isUserMatching) {
    res.status(404).json({
      success: false,
      error: 'Username and password does not match!',
    }) 
    return;
  }
  
  const { password: excluded, ...userDetails } = existingUser;
  res.status(200).json({
    success: true,
    data: {
      ...userDetails,
      token: 'domainexpansion',
    },
  })
})

app.post('/api/auth/logout', (req, res) => {
  const { headers: { token }, body: { username } } = req

  const isTokenExisting = !!token
  const isUsernameExisting = !!username
  if (!isTokenExisting || !isUsernameExisting) {
    res.sendStatus(400)
    return;
  }

  res.sendStatus(205)
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