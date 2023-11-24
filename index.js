const express = require('express');
const knex = require('knex');
const app = express();
const port = 3000;

const users = [
    {
        id: 1,
        name: 'J',
        age: 25
    }
];

const database = knex ({
    client: 'postgres',
    connection: {
        host: 'localhost',
        port: 3386,
        user: 'root',
        password: 'admin',
        database: 'exercise1',
    }
});

// middleware
app.use(express.json());

app.get('/users', async (request, response) => {
    const usersQuery = await database('users').select('*');
    response.json(usersQuery)
});

app.post('/users', async (request, response) => {
    const body = request.body;
    // const id = users[users.length-1].id+1;
    // const pet = {
    //     id,
    //     ...body
    // };

    // users.push(pet);

    const user = await database('users').insert({
        first_name: body.first_name,
        last_name: body.last_name,
    }).returning('*');

    response.json(user[0]);
});

app.listen(port, () => {console.log('server connected')});