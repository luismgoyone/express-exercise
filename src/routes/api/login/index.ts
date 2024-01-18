import validator from '@middleware/user-credentials';
import UserLogin from '@models/UserLogin';
import ExpressCustomRequest from "@utils/types/express-request";
import { UserLoginType } from '@utils/types/request';
import { Response, Router } from "express";
import jwt from 'jsonwebtoken';

const routes = Router()

// checks db if username and password match with the incoming userlogin creds

const privateKey = process.env.SECRET_KEY || 'random'

routes.post('/login', validator, async (request: ExpressCustomRequest<UserLoginType>, response: Response) => {
  const { username } = request.body

  // const token = jwt.sign({ id: res.locals.userId })
  const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: 'UTC' });

  const token = jwt.sign({ id: response.locals.userId }, privateKey!)

  console.log('Updating the data')
  console.log(token, 'this is a token')
  await UserLogin.update({token, last_login_at: timestamp}, { username })



  return response.status(200).send({"result": "test"})
})

export default routes