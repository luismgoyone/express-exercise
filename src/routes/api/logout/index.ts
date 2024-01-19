import tokenAuthentication from '@middleware/token-authentication';
import UserLogin from '@models/UserLogin';
import ExpressCustomRequest from "@utils/types/express-request";
import { UserLoginType } from '@utils/types/request';
import { Response, Router } from "express";

const routes = Router()

const privateKey = process.env.SECRET_KEY || 'random'

routes.post('/logout', tokenAuthentication, async (request: ExpressCustomRequest<UserLoginType>, response: Response) => {
  const user_id = response.locals.tokenId
  console.log('user id : ', response.locals.tokenId)

  await UserLogin.update({ token: null },{ user_id })
  
  return response.status(200).send({
    "success": true
  })
})

export default routes