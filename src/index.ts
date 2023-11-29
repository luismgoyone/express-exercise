import express, { Express, } from 'express'
import { config } from 'dotenv'
import health from './routes/health'
import registerUser from './routes/api/register'

config()

// instance of express
const app: Express = express() 
const port = process.env.PORT || 8000

// parse data sent in http
app.use(express.json())

const prefix = '/exercise-express-pg'


// register routes
app.use(prefix, health)
app.use(prefix, registerUser)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

// note to self: entire project is working under one instance of express
export default app