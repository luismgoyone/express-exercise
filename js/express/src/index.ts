import express from 'express';
import expressOpenApi, { SPEC_OUTPUT_FILE_BEHAVIOR } from 'express-oas-generator';
import { initializeDB } from './db';
import { 
  IDatabase, 
  // ParameterizedQuery 
} from 'pg-promise';

// NOTE: Mock
const nonExistentUser = {
  id: 666,
  first_name: 'sukuna',
  last_name: 'ryomen',
  username: 'malevolent',
  password: 'shrine666'
}

const existingUser = {
  id: 1,
  first_name: 'satoru',
  last_name: 'gojo',
  username: 'sixeyes',
  password: 'limitless',
}

const port = process.env.PORT;

const app = express();

let db: null | IDatabase<any> = null;

// NOTE: Middlewares
expressOpenApi.handleResponses(app, {
  predefinedSpec: {
    info: {
      title: 'Joppet\'s API Exercise - Express Implementation',
      version: "0.0.0",
      description: "Testing lang",
    },
    tags: [
      {
        name: 'auth',
        description: 'user creation and authentication',
      },
      {
        name: 'posts',
        description: 'user posts operations',
      },
    ]
  },
  tags: ['status', 'auth', 'posts'],
  specOutputPath: 'docs/api.json',
  specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.RECREATE,
  swaggerDocumentOptions: null,
});

app.use(express.json());

// NOTE: Logger
app.use((req, res, next) => {
  console.log(`[server | ${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(req.body);
  next();
});

// NOTE: Routes
const router = express.Router()
router.route('/api/status').get((_, res, next) => {
  res.status(200).json({
    message: 'Server up!'
  });
  next();
});

// NOTE: Auth
router.route('/api/auth/register').post(async (req, res, next) => {
  const {
    body: {
      username,
      password,
      first_name,
      last_name,
    }
  } = req;

  // TODO: Add bcrypt?
  const isPasswordLessThan8Characters = password.length < 8
  if (isPasswordLessThan8Characters) {
    res.status(400).json({
      message: 'Password should be 8 characters or above!',
    })
    next();
    return;
  }

  // REVIEW: SELECT * is more expensive than SELECT username
  
  // REVIEW: More explicit:
  // const findUsernameByUsername = new ParameterizedQuery({
  //   text: 'SELECT username FROM user_logins WHERE username = $1', 
  //   values: [username]
  // });

  if (!db) {
    res.sendStatus(500);
    next();
    return;
  }
  
  try {
    const findUsernameQueryResponse = await db.oneOrNone(
      'SELECT username FROM user_logins WHERE username = $1',
      username,
    );
    const isUsernameExisting = !!findUsernameQueryResponse;
    if (isUsernameExisting) {
      res.status(409).json({
        message: 'User already exists!'
      })
      next();
      return;
    }

    const createUserQueryResponse = await db.one(
      `
        WITH 
          new_user AS (
          INSERT INTO users (first_name, last_name) 
            VALUES ($1, $2)
            RETURNING id, first_name, last_name
          ), 
          new_login AS (
            INSERT INTO user_logins (user_id, username, password) 
            VALUES (
              (SELECT id from new_user), $3, $4
            ) 
            RETURNING username
          )
        SELECT * from new_user CROSS JOIN new_login;
      `,
      [first_name, last_name, username, password],
    )

    res.status(201).json({
      data: createUserQueryResponse,
    })
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: 'Something went wrong!',
    });
  }

  next();
})

router.route('/api/auth/login').post((req, res, next) => {
  const { username, password } = req.body;

  const nonExistentUsername = 'panda'
  const isUserExisting = username !== nonExistentUsername
  
  const isUserMatching = username === existingUser.username && password === existingUser.password  

  if (!isUserExisting || !isUserMatching) {
    res.status(404).json({
      message: 'Username and password does not match!',
    }) 
    next();
    return;
  }
  
  const { password: excluded, ...userDetails } = existingUser;
  res.status(200).json({
    data: {
      ...userDetails,
      token: 'domainexpansion',
    },
  })
  next();
})

router.route('/api/auth/logout').post((req, res, next) => {
  const { headers: { token }, body: { username } } = req

  const isTokenExisting = !!token
  const isUsernameExisting = !!username
  if (!isTokenExisting || !isUsernameExisting) {
    res.sendStatus(400);
    next();
    return;
  }

  res.sendStatus(205);
  next();
})

// Posts
router.route('/api/posts').get((req, res, next) => {
  const { headers: { token } } = req

  const isTokenExisting = !!token
  if (!isTokenExisting) {
    res.status(401).json({
      message: 'Unauthorized post access!',
    })
    next();
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

  res.status(200).json({
    data,
  })
  next();
})


router.route('/api/posts/:user_id').get((req, res, next) => {
  const { headers: { token }, params: { user_id } } = req

  const isTokenExisting = !!token
  if (!isTokenExisting) {
    res.status(401).json({
      message: 'Unauthorized post access!',
    })
    next();
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

  const filteredData = data
    .filter((post) => Number(user_id) === users[post.username])
    .map(post => ({ id: post.id, content: post.content  }))

  res.status(200).json({
    data: filteredData,
  })
  next();
})

router.route('/api/posts/:user_id').post((req, res, next) => {
  const { body: { content }, params: { user_id }, headers: { token } } = req

  const isTokenExisting = !!token
  if (!isTokenExisting) {
    res.status(401).json({
      message: 'Unauthorized post creation!',
    })
    next();
    return;
  }

  const isMalformedRequestBody = !content
  if (isMalformedRequestBody) {
    res.status(400).json({
      message: 'Malformed request!',
    })
    next();
    return;
  }

  res.status(201).json({
    data: {
      id: Math.floor(Math.random()),
      content,
    }
  })
  next();
})

router.route('/api/posts/:user_id').patch((req, res, next) => {
  const { 
    params: { user_id }, // TODO: use on PSQL integ
    headers: { token },
    body: { id, content }
  } = req

  const isTokenExisting = !!token
  if (!isTokenExisting) {
    res.status(401).json({
      message: 'Unauthorized post update!',
    })
    next();
    return;
  }

  const isMalformedRequestBody = !content
  if (isMalformedRequestBody) {
    res.status(400).json({
      message: 'Malformed request!',
    })
    next();
    return;
  }

  res.status(200).json({
    data: {
      id, content
    }
  })
  next();
})

router.route('/api/posts/:user_id').delete((req, res, next) => {
  const { params: { user_id } } = req

  res.sendStatus(204);
  next();
})

app.use(router);

expressOpenApi.handleRequests();

const server = app.listen(port, async () => {
  try {
    db = await initializeDB();
    if (!db) {
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

// TODO:
// 1. Research on middleware in terms of distinguishing routes that needs to be authorized / with token, and those that are public