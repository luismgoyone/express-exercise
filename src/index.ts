import express from 'express';
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
require("dotenv").config();

const port = process.env.PORT
const app = express()
app.use(express.json())

app.use('/users',userRoutes)
app.use('/posts',postRoutes)

app.listen(port,() => {
    console.log(`CONNECTED TO SERVER localhost:${port}`)
})