const client = require('./connection.js');
const express = require('express');
const bodyParser = require('body-parser');
const date = require("date-and-time")

const app = express();
const port = 3300;

function generateToken(){
    const length = 24;
    //edit the token allowed characters
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

function query(sql, values) {
    return new Promise((resolve, reject) => {
        client.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`Connected to port ${port}`);
});

app.use(bodyParser.json());

client.connect();

app.post('/register', async (req, res) => {
    try {
        const user = req.body;

        if(!user.first_name || !user.last_name || !user.username || !user.password) {
            return res.send("ERROR: Incomplete details.");
        }

        const userQuery = await query(`SELECT * FROM user_logins WHERE username='${user.username}'`);
        if(userQuery.rowCount > 0) {
            return res.send("ERROR: Username already exists.");
        }

        if(user.password.length < 8) {
            return res.send("ERROR: Password should be at least 8 characters.");
        }

        const insertQuery = await query(`INSERT INTO users (first_name, last_name) VALUES ('${user.first_name}', '${user.last_name}') RETURNING id`);

        const userId = insertQuery.rows[0].id;

        // await query(`INSERT INTO user_logins (user_id, username, password)
        //                 VALUES (${userId}, '${generateToken()}', '${formattedDate()}', '${user.username}', '${user.password}')`);

        await query(`INSERT INTO user_logins (user_id, username, password) VALUES (${userId}, '${user.username}', '${user.password}')`);

        const userRecord = await query(`
            SELECT a.id, a.first_name, a.last_name, b.username 
            FROM users a 
            JOIN user_logins b ON a.id = b.user_id
            WHERE a.id = ${userId}`);

        console.log("Registered new user.");
        res.send(userRecord.rows[0]);
    }
    catch (err) {
        console.error("Error during registration: ", err.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        const user = req.body;

        if(!user.username || !user.password) {
            return res.send("ERROR: Incomplete details.");
        }

        const userQuery = await query(`SELECT * FROM user_logins WHERE username='${user.username}'`);
        if(userQuery.rowCount === 0) {
            return res.send("ERROR: User does not exist.");
        }

        if(userQuery.rows[0].password !== user.password) {
            return res.send("ERROR: Username and password does not match.");
        }

        const token = generateToken();
        const formattedDate = date.format(new Date(), 'MM/DD/YYYY HH:mm:ss ZZ');
        await query(`UPDATE user_logins 
                        SET token='${token}', 
                            last_login_at='${formattedDate}' 
                        WHERE user_id=${userQuery.rows[0].user_id}`);

        const userRecord = await query(`
            SELECT a.id, a.first_name, a.last_name, b.username, b.token
            FROM users a 
            JOIN user_logins b ON a.id = b.user_id
            WHERE a.id = ${userQuery.rows[0].user_id}`);

        console.log("Successfully logged in.");
        res.send(userRecord.rows[0]);
    }
    catch (err) {
        console.error("Error during login: ", err.message);
    }
});

app.post('/logout', async (req, res) => {
    // INQUIRY ON PASSING TOKEN AS HEADER + VALIDATION 😭 //
    try {
        const user = req.body;

        const userQuery = await query(`SELECT * FROM user_logins WHERE user_id=${user.id}`);
        if(userQuery.rows[0].token === null) {
            return res.send("ERROR: User is not logged in.");
        }

        await query(`UPDATE user_logins SET token=null WHERE user_id=${user.id}`);

        console.log("Successfully logged out.");
        res.send({
            success: true
        })
    }
    catch (err) {
        console.error("Error during logout: ", err.message);
    }
});

app.post('/posts/create', async (req, res) => {
    try {
        const user = req.body;

        if(!user.user_id || !user.content) {
            return res.send("ERROR: Incomplete details.");
        }

        const formattedDate = date.format(new Date(), 'MM/DD/YYYY HH:mm:ss ZZ');

        const insertQuery = await query(`INSERT INTO posts (user_id, content, created_at) 
                        VALUES (${user.user_id}, '${user.content}', '${formattedDate}')
                        RETURNING id, content`);
        

        console.log("Created new post.");
        res.send({
            id: insertQuery.rows[0].id,
            content: insertQuery.rows[0].content
        });
    }
    catch (err) {
        console.error("Error on post creation: ", err.message);
    }
});

app.post('/posts/update', async (req, res) => {
    try {
        const user = req.body;

        if(!user.post_id || !user.content) {
            return res.send("ERROR: Incomplete details.");
        }

        const postQuery = await query(`SELECT * FROM posts WHERE id=${user.post_id}`);
        if(postQuery.rowCount === 0) {
            return res.send("ERROR: Post does not exist.");
        }

        const updateQuery = await query(`UPDATE posts SET content='${user.content}' WHERE id=${user.post_id} RETURNING id, content`);
        
        console.log("Updated post.");
        res.send({
            id: updateQuery.rows[0].id,
            new_content: updateQuery.rows[0].content
        });
    }
    catch (err) {
        console.error("Error on updating post: ", err.message);
    }
});

app.post('/posts/delete', async (req, res) => {
    try {
        const user = req.body;

        if(!user.post_id) {
            return res.send("ERROR: Incomplete details.");
        }

        const postQuery = await query(`SELECT * FROM posts WHERE id=${user.post_id}`);
        if(postQuery.rowCount === 0) {
            return res.send("ERROR: Post does not exist.");
        }

        const updateQuery = await query(`DELETE FROM posts WHERE id=${user.post_id} RETURNING id, content`);
        
        console.log("Deleted post.");
        res.send({
            success: true,
            id: updateQuery.rows[0].id,
            new_content: updateQuery.rows[0].content
        });
    }
    catch (err) {
        console.error("Error on updating post: ", err.message);
    }
});

app.post('/posts/all', async (req, res) => {
    try {
        const allPostsQuery = await query(`SELECT a.id, a.content, b.first_name, b.last_name, c.username, a.created_at
                                            FROM posts a
                                            JOIN users b ON a.user_id = b.id
                                            JOIN user_logins c ON a.user_id = c.user_id
                                            ORDER BY a.created_at DESC`);
        res.send({
            data: allPostsQuery.rows
        });
    }
    catch (err) {
        console.error("Error on displaying all posts: ", err.message);
    }
});

app.post('/posts/user', async (req, res) => {
    try {
        const user = req.body;

        if(!user.user_id) {
            return res.send("ERROR: Incomplete details.");
        }

        const postQuery = await query(`SELECT * FROM posts WHERE user_id=${user.user_id}`);
        if(postQuery.rowCount === 0) {
            return res.send("ERROR: User has no post/s");
        }

        const allPostsQuery = await query(`SELECT id, content
                                            FROM posts WHERE user_id=${user.user_id}`);
        res.send({
            data: allPostsQuery.rows
        });
    }
    catch (err) {
        console.error("Error on displaying user posts: ", err.message);
    }
});