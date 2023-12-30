import express from 'express';
import { routes } from './routes/routes';


const port = process.env.PORT
const app = express()
app.use(express.json())

routes(app)

app.listen(port,() => {
    console.log(`CONNECTED TO SERVER localhost:${port}`)
})