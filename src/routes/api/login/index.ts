import usernameAuthentication from '@middleware/username-authentication';
import UserLogin from '@models/UserLogin';
import ExpressCustomRequest from "@utils/types/express-request";
import { UserLoginType } from '@utils/types/request';
import { Response, Router } from "express";
import jwt from 'jsonwebtoken';

const routes = Router()

const privateKey = process.env.SECRET_KEY || 'random'

routes.post('/login', usernameAuthentication, async (request: ExpressCustomRequest<UserLoginType>, response: Response) => {
  const { username } = request.body

  const timestamp = new Date().toLocaleTimeString('en-US', { timeZone: 'UTC' });
  console.log('response.locals.userId : ', response.locals.userId )
  const token = jwt.sign({ id: response.locals.userId }, privateKey!)

  const { user_id: id } = await UserLogin.update({token, last_login_at: timestamp}, { username })
  
  const result = await UserLogin.getById(id)
  
  return response.status(200).send(result)
})

export default routes