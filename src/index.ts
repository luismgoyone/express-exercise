import express from 'express';
const userRoutes = require('./routes/userRoutes')
require("dotenv").config();

const port = process.env.PORT
const app = express()
app.use(express.json())

app.use('/users',userRoutes)

app.listen(port,() => {
    console.log(`CONNECTED TO SERVER localhost:${port}`)
})