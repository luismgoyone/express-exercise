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


// NOTE: Auth
app.post('/api/auth/register', (req, res) => {
  const { id, ...userDetails } = existingUser

  const isUserExisting = JSON.stringify(req.body) === JSON.stringify(userDetails)
  if (isUserExisting) {
    res.status(409).json({
      success: false,
      message: 'User already exists!'
    })    
    return;
  }

  const isPasswordLessThan8Characters = req.body.password.length < 8
  if (isPasswordLessThan8Characters) {
    res.status(400).json({
      success: false,
      message: 'Password should be 8 characters or above!',
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
      message: 'Username and password does not match!',
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

// Posts
app.get('/api/posts/:user_id?', (req, res) => {
  const { headers: { token }, params: { user_id } } = req

  const isTokenExisting = !!token
  if (!isTokenExisting) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized post access!',
      }
    })
    return;
  }

  let data = []
  const date = new Date()
  date.setHours(date.getHours() + 5)
  data.push({
    id: 2,
    content: "i don't know how i'll feel when i'm dead, but i don't want to regret the way i lived.",
    first_name: 'yuji',
    last_name: 'itadori',
    username: 'enchain',
    created_at: date.toISOString(),
  })
  date.setHours(date.getHours() - 40)
  data.push({
    id: 3,
    content: "what makes us obligated to meet such perfection or such absurd standards?",
    first_name: 'nobara',
    last_name: 'kugisaki',
    username: 'hairpin',
    created_at: date.toISOString(),
  })
  date.setHours(date.getHours() + 20)
  data.push({
    id: 4,
    content: "i want more good people to enjoy fairness, even if only a few.",
    first_name: 'megumi',
    last_name: 'fushiguro',
    username: 'tenshadows',
    created_at: date.toISOString(),
  },)
  data.push({
    id: 4,
    content: "it's not about whether i can. i have to do it.",
    first_name: 'megumi',
    last_name: 'fushiguro',
    username: 'tenshadows',
    created_at: date.toISOString(),
  })

  const users: Record<string, number> = {
    'tenshadows': 1,
    'hairpin': 2,
    'enchain': 3
  }

  data.sort((a, b) => (a.created_at < b.created_at) ? -1 : ((a.created_at > b.created_at) ? 1 : 0))

  if (!user_id) {
    res.status(200).json({
      success: true,
      data,
    })
    return;
  }

  const filteredData = data
    .filter((post) => Number(user_id) === users[post.username])
    .map(post => ({ id: post.id, content: post.content  }))

  res.status(200).json({
    success: true,
    data: filteredData,
  })
})

app.post('/api/posts/:user_id', (req, res) => {
  const { body: { content }, params: { user_id }, headers: { token } } = req

  const isTokenExisting = !!token
  if (!isTokenExisting) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized post creation!',
    })
    return;
  }

  const isMalformedRequestBody = !content
  if (isMalformedRequestBody) {
    res.status(400).json({
      success: false,
      message: 'Malformed request!',
    })
    return;
  }

  res.status(201).json({
    success: true,
    data: {
      id: Math.floor(Math.random()),
      content,
    }
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