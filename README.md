## Feedback

1. [HTTP Response Code for Resource Already Exists](https://stackoverflow.com/questions/3825990/http-response-code-for-post-when-resource-already-exists) - it's funny how the response codes are not really very strictly followed, or maybe it's really a living standard that you will see the cracks in its surface hehe.

2. Is there some package that does something like when we used `graphql-tag`?: 
```ts
  psql`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(20),
        last_name VARCHAR(20)
      );`
```

3. When I started this, I realize, i need the MVC paradigm. Even if I'm not 100% wanting to use rails, I appreciated the workflow of creating models, and just cli-ing to create migrations. I am returning to my working knowledge of MERN, by returning, going back to learning it, I haven't used it in production! Is there a good MVC framework for express? My code is about to be spaghetti. 

4. Being a tech lead is hard. It might not be for every one. Hell, I feel it's not really for me. Because I missed this intensity of just thinking about code, and as I continue this exercise, it feels like I got back home. I mean, you will always realize that to be able to think better as a lead, you need to actually implement all the little details. This is yet again a humbling experience for me because even if I know I don't know everything, I am forgetting some things! So my stand now, to be a tech lead should be not to eliminate coding but to always be vigilant in terms of opportunities to delegate. Like a true king that starts riding at the front of his army towards the enemy.

5. I think we should standardize anything about api - the contract of BE and FE early on. And utilize response codes instead of returning boolean success. 

### For API Standardization
1. Use of more meaningful response status codes
2. Try to create a standard shape for response object:

```
{
  "success": Boolean // we might not need this if we utilize response status codes! Response.ok can be utilized too
  "data": Array or Object
  "message": programmatical error made by devs
  "error": system generated error message
}
```
3. Error Codes - (enum types)
4. Message - can be non enum, for personalized message
5. Review of resource / endpoint url structure
6. [About modelling json api](https://stackoverflow.com/a/14538774)
- JSend opinionated about status as required on message body, i need an example for this:
> The spec is meant to be as small, constrained, and generally-applicable as possible. As such, it has to be somewhat self-contained. A common pattern for implementing JSON services is to load a JavaScript file which passes a JSON block into a user-specified callback. JSON-over-XHR handling in many JavaScript frameworks follows similar patterns. As such, the end-user (developer) never has a chance to access the HTTP response itself.
- JSONAPI needs to be setup.
7. What's more expensive, sql or code manipulation?
8. Better rollback system for developing queries? - BEGIN COMMIT helps.
9. How to organize psql query strings?
10. Research about stored procedures and atomicity. Check standards for PSQL.
11. Endpoint naming
12. Research on SQL Injection and other security stuff
13. Folder structure
14. Explore pgTap or other unit to regresstion testing for pgsql scripts.

## Route Anatomy (Express Implementation)
```ts

router.route(
  ENDPOINT // 1. URL Endpoint Subpath
)
.post( // 2. REST Method
  async( // Usually async due to db operations
    (req, res, next) => {
      const  { headers, body, params } = req // 3. Request Destructuring

      // 4. Response Body Type Checking - explore ORMs for this!
      const isUserLogin = Object.keys(body).length === 2
        && body.username
        && body.password
        
      const isUserRegistration = Object.keys(body).length === 4
        && body.first_name
        && body.last_name
        && body.username
        && body.password

      if (!isUserLogin && !isUserRegistration) { // 5. Client-Side Body Type Guard Clauses - to be able to resolve request that can be resolved due to (4.) without always interacting with the DB.ž
        res.status(400).json({
        message: 'Malformed content!',
        })
        next();
        return;
      }

      // 6. Client-Side Request Body Guard Clauses
      const isPasswordLessThan8Characters = body.password.length < 8
        if (isPasswordLessThan8Characters) {
          res.status(400).json({
            message: 'Password should be 8 characters or above!',
          })
          next();
          return;
        }

      if (!db) { // 6. DB Guard Clause - Check first if db is active as first logic?
        res.status(500).json({
        message: 'Something went wrong!',
        });
        next(); // Always have next() and return calls for each decision point, given that an all-route logic exists to cover 5xx cases
        return;
      }

      try { // 7. Try Block - this encapsulates all logic with DB operations to catch errors!

        if (isUserRegistration) { // Each clause is defined by (4.)
          const registerUserQueryResponse = await db.oneOrNone( // 8. PSQL DB Operation - to try as much as possible to have only one query even for error case
            `
              WITH 
              new_user AS (
                INSERT INTO users (first_name, last_name) 
                  SELECT $1, $2
                  WHERE NOT EXISTS (
                    SELECT 1 
                      FROM user_logins 
                        WHERE username = $3    
                  )
                    RETURNING id, first_name, last_name
              ), 
              new_login AS (
                INSERT INTO user_logins (user_id, username, password)
                  SELECT (SELECT id FROM new_user), $3, $4
                    WHERE NOT EXISTS (
                      SELECT 1 
                        FROM user_logins 
                          WHERE username = $3    
                    )
                      RETURNING username
              ) 
              SELECT * FROM new_user CROSS JOIN new_login;
            `,
            [body.first_name, body.last_name, body.username, body.password],
          )

          // 9. Response Blocks
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
          //...
          next()
          return;
        }
      } catch (e) { 
        console.error(e);
        res.status(500).json({ // Same as DB Guard Clause but this is not Server-Side
          message: 'Something went wrong!',
        })
        next();
        return;
      }
    }
  )
)

```

## Response Blocks Anatomy (Express Implementation)

### Success Case
```ts
 res // 1. Response Object
  .status(201) // 2. HTTP Status Code
  .json({ // 3. JSON Body
    data: registerUserQueryResponse,
  })
  next(); // 4. Express Handling
  return; // Always return
```

### Fail Case
```ts
  const isUsernameExisting = !registerUserQueryResponse // 1. Condition Logic
  if (isUsernameExisting)  { // 2. Condition Block
    res // 3. Response Object
      .status(409) // 4. HTTP Status Code
      .json({ // 5. JSON Body
        message: 'User already exists!'
      })
    next(); // 6. Express Handling
    return; // Always return
  }
```


## Plan
- [ ] Vitest + Playwright (API Testing)
- [ ] Express (Node)
- [ ] Fastify (Node)
- [ ] Go
- [ ] SAM (Go)

## References
1. [Pern Stack Course](https://www.youtube.com/watch?v=ldYcgPKEZC8)
2. [HTTP Response Code for Resource Already Exists](https://stackoverflow.com/questions/3825990/http-response-code-for-post-when-resource-already-exists)
3. [REST method for Logout - POST](https://stackoverflow.com/a/14587231/8547125)
4. [HTTP Response Code for Logout - 205](https://stackoverflow.com/a/36220291/8547125)

### Postgres Setup
Creating new postgres user:
```bash
CREATE ROLE pgadmin WITH LOGIN PASSWORD 'pg4dm1n!';
ALTER ROLE pgadmin CREATEDB;
```


---

### BE Exercise (Node.js & PostgreSQL)

# Overview
create a backend application that allows user registration/login as well as create posts for each user

Installation

PostgreSQL

* LINUX (UBUNTU) - https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-22-04-quickstart
* WINDOWS - https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql/
* MACOS - https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql-macos/
* DOCKER - https://www.baeldung.com/ops/postgresql-docker-setup

PGAdmin tool (optional)

* LINUX (APT) - https://www.pgadmin.org/download/pgadmin-4-apt/
* WINDOWS - https://www.pgadmin.org/download/pgadmin-4-windows/
* MACOS - https://www.pgadmin.org/download/pgadmin-4-macos/



DB Schema
```
users
    id: int (auto increment)
    first_name: varchar(20)
    last_name: varchar(20)

user_logins
    user_id: int
    token: text
    last_login_at: timestamp
    username: varchar(20)
    password: varchar(20)

posts
    id: int (auto increment)
    user_id: int
    content: text
    created_at: timestamp
```



Endpoints

* register user 
    * pass first_name, last_name, username and password as parameters/payload
    * validations 
        * if username exists in db, return an error
        * if password is less than 8 characters, return an error
    * insert into users and user_login tables
    * return user record (USE JOIN)
```
{
    "id": <user id>
    "first_name": <user first name>,
    "last_name": <user last name>,
    "username": <user username>
}
```



* login user 
    * pass username and passowrd as parameters/payload
    * validations 
        * if username does not exist, return an error
        * if username and password combination is invalid, return an error
    * retrieve record from DB (USE JOIN)
    * return user record (USE JOIN)
```
{
    "id": <user id>
    "first_name": <user first name>,
    "last_name": <user last name>,
    "username": <user username>,
    "token": token
}
```


* logout user
    * pass token as header
    * validations 
        * if token is invalid, return an unauthorized error
    * update user_logins.token to null
    * return success
```
{
    "success": <boolean>
}
```



* list down all posts 
    * pass token as header
    * validations 
        * if token is invalid, return an unauthorized error
    * return posts sorted by most recent created_at
```
{
    "data": [
        {
            "id": <post id>,
            "content": <post content>,
            "first_name": <post user first_name>,
            "last_name": <post user last_name>,
            "username": <post user username>,
        }
    ]
}
```



* list down user posts 
    * pass token as header
    * pass user id as parameter/payload
    * validations 
        * if token is invalid, return an unauthorized error
    * return posts
```
{
    "data": [
        {
            "id": <post id>,
            "content": <post content>,
        }
    ]
}
```



* create post 
    * pass token as header
    * pass user id and content as parameters/payload
    * validations 
        * if token is invalid, return an unauthorized error
    * return post record
```
{
    "id": <post id>,
    "content": <post content>,
}
```



* update post 
    * pass token as header
    * pass post id and content as parameters/payload
    * validations 
        * if token is invalid, return an unauthorized error
    * return post record
```
{
    "id": <post id>,
    "content": <post content>,
}
```




* delete post 
    * pass token as header
    * pass post id as parameter/payload
    * validations 
        * if token is invalid, return an unauthorized error
    * return post record
```
{
    "id": <post id>,
    "content": <post content>,
}
```

