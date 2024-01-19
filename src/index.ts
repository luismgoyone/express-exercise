import login from '@routes/api/login'
import logout from '@routes/api/logout'
import registerUser from '@routes/api/register'
import health from '@routes/health'
import { config } from 'dotenv'
import express, { Express, } from 'express'


config()

// instance of express
const app: Express = express() 
const port = process.env.PORT || 8000

// parse data sent in http
app.use(express.json())

const prefix = '/exercise'

// register routes
app.use(prefix, health)
app.use(prefix, registerUser)
app.use(prefix, login)
app.use(prefix, logout)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

export default app