
## Changelog


### Plan
0. Vitest + Playwright (API Testing)
1. Express (Node)
2. Fastify (Node)
3. Go
4. SAM (Go)

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

