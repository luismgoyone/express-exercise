import express from 'express';
import { initializeDB, resetDB } from './db';
import { 
  IDatabase, 
  // ParameterizedQuery 
} from 'pg-promise';
// Docs
import expressOpenApi, { SPEC_OUTPUT_FILE_BEHAVIOR } from 'express-oas-generator';
import fs from 'fs'
import { LOGIN_USER, REGISTER_USER } from './queries';
const dbmlSVG = fs.readFileSync('./docs/dbml.svg');


// Initialization
const port = process.env.PORT;

const app = express();

let db: null | IDatabase<any> = null;

// NOTE: Middlewares
expressOpenApi.handleResponses(app, {
  predefinedSpec: {
    info: {
      title: 'Joppet\'s API Exercise - Express (Basic Node) Implementation',
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
  swaggerUiServePath: 'docs',
});

app.get('/docs/dbml', (req, res, next) => {
  res.set('Content-Type', 'image/svg+xml');
  res.send(dbmlSVG);
  next();
})

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
  return;
});

// NOTE: Auth
router.route('/api/auth').post(async (req, res, next) => {
  const { body } = req;

  const isUserLogin = Object.keys(body).length === 2
    && body.username
    && body.password
    
  const isUserRegistration = Object.keys(body).length === 4
    && body.first_name
    && body.last_name
    && body.username
    && body.password

  if (!isUserLogin && !isUserRegistration) {
    res.status(400).json({
      message: 'Malformed content!',
    })
    next();
    return;
  }

  // TODO: Add bcrypt?
  const isPasswordLessThan8Characters = body.password.length < 8
  if (isPasswordLessThan8Characters) {
    res.status(400).json({
      message: 'Password should be 8 characters or above!',
    })
    next();
    return;
  }

  if (!db) {
    res.status(500).json({
      message: 'Something went wrong!',
    });
    next();
    return;
  }

  try {
    if (isUserRegistration) {
      // REVIEW: SELECT * is more expensive than SELECT username
    
      // REVIEW: More explicit:
      // const findUsernameByUsername = new ParameterizedQuery({
      //   text: 'SELECT username FROM user_logins WHERE username = $1', 
      //   values: [username]
      // });

      // REVIEW: This is if separated from the main query for creation
      // const findUsernameQueryResponse = await db.oneOrNone(
      //   'SELECT username FROM user_logins WHERE username = $1',
      //   body.username,
      // );
      // const isUsernameExisting = !!findUsernameQueryResponse;
      // if (isUsernameExisting) {
      //   res.status(409).json({
      //     message: 'User already exists!'
      //   })
      //   next();
      //   return;
      // }
  
      const registerUserQueryResponse = await db.oneOrNone(
        REGISTER_USER,
        [body.first_name, body.last_name, body.username, body.password],
      )

      const isUsernameExisting = !registerUserQueryResponse
      if (isUsernameExisting)  {
        res.status(409).json({
          message: 'User already exists!'
        })
        next();
        return;
      }

      res.status(201).json({
        data: registerUserQueryResponse,
      })
      next();
      return;
    }

    if (isUserLogin) {
      // const findUsernameQueryResponse = await db.oneOrNone(
      //   'SELECT username FROM user_logins WHERE username = $1',
      //   body.username,
      // );
      // const isUsernameExisting = !!findUsernameQueryResponse;
      // if (!isUsernameExisting) {
      //   res.status(404).json({
      //     message: 'Username and password does not match!',
      //   }) 
      //   next();
      //   return; 
      // }

      // Generate new token
      const newToken = Math.random().toString(36).substring(2, 10)
  
    
      // TODO: use bcrypt
      const loginQueryResponse = await db.oneOrNone(
        LOGIN_USER,
        [newToken, body.username, body.password],
      )
  
      const isUsernameExistingAndPasswordMatching = !!loginQueryResponse
      if (!isUsernameExistingAndPasswordMatching) {
        res.status(404).json({
          message: 'Username and password does not match!',
        }) 
        next();
        return;
      }
  
      const { id, first_name, last_name, username, token } = loginQueryResponse
      res.status(200).json({
        data: {
          id,
          first_name,
          last_name,
          username,
          token: 'domainexpansion',
        },
      })
      next();
      return;
    }

  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: 'Something went wrong!',
    });
    next();
    return;
  }
})

router.route('/api/auth/:id').post(async (req, res, next) => {
  const { headers, params } = req;

  const isTokenExisting = !!headers.token;
  if (!isTokenExisting) {
    res.status(401).json({
      message: 'Unauthorized!',
    });
    next();
    return;
  }

  if (!db) {
    res.status(500).json({
      message: 'Something went wrong!',
    });
    next();
    return;
  }

  try {
    const updateUserLoginQueryResponse = await db.oneOrNone(
      `
        UPDATE user_logins
          SET token = NULL
            WHERE token = $1 AND user_id = $2
              RETURNING user_id
      `,
      [headers.token, params.id]
    )

    const isUserLoggedOut = !!updateUserLoginQueryResponse

    if (!isUserLoggedOut) {
      res.status(400).json({})
      next();
      return;
    }
 
    if (isUserLoggedOut) {
      res.status(205).json({});
      next();
      return;
    }
  } catch(e) {
    console.error(e);
    res.status(500).json({
      message: 'Something went wrong!',
    })
    next();
    return;
  }
})

// Posts
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

    process.on('SIGINT', () => resetDB(db));
    process.on('SIGTERM', () => resetDB(db));
    process.on('SIGQUIT', () => resetDB(db));

    console.info(`[server]: Server running at http://localhost:${port}/api`)
  } catch(error) {
    console.error('[server]: Error opening server connection');
    return;
  }  
});



// TODO:
// 1. Research on middleware in terms of distinguishing routes that needs to be authorized / with token, and those that are public