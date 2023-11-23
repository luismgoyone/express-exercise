import express, { Express, Request, Response, Application, response, Router } from 'express'
import { config } from 'dotenv'
import healthCheck from './routes/health-check' // TODO: fix tsconfig path

config()

// instance of express
const app: Express = express() 
const port = process.env.PORT || 8000

// register routes
// note to self: prefix/ endpoint
app.use('/test', healthCheck)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

// note to self: entire project is working under one instance of express
export default app