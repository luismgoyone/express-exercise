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

5. 


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

