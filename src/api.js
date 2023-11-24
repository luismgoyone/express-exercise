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

        await query(`INSERT INTO users (first_name, last_name) VALUES ('${user.first_name}', '${user.last_name}')`);

        const selectUserIdQuery = await query(`SELECT id FROM users WHERE first_name='${user.first_name}' AND last_name='${user.last_name}'`)
        const userId = selectUserIdQuery.rows[0].id;

        // await query(`INSERT INTO user_logins (user_id, username, password)
        //                 VALUES (${userId}, '${generateToken()}', '${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss ZZ')}', '${user.username}', '${user.password}')`);

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

        await query(`UPDATE user_logins 
                        SET token='${generateToken()}', 
                            last_login_at='${date.format(new Date(), 'MM/DD/YYYY HH:mm:ss ZZ')}' 
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
            "success": true
        })
    }
    catch (err) {
        console.error("Error during logout: ", err.message);
    }
});