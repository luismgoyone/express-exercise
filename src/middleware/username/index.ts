import { Request, Response, NextFunction} from 'express'
import { UserRegister } from '@utils/types/register'
import UserLogin from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'

// note to self: - Request<P = core.ParamsDictionary, ResBody = any, ReqBody = any>
const usernameValidator = async (request: ExpressCustomRequest<UserRegister> , response: Response, next: NextFunction) => {
  const { username } = request.body
  console.log('incoming username: ', username)

  // returns if username is empty
  if(!username) {
    response.status(500).send('username is empty')
  }

  const result = await UserLogin.getVerified({ username }) 
  
  if(username === result || !result) {
    return response.status(500).send('username is already taken!')

  }

  console.log('username is good ✅\n')
  next()
}

export default usernameValidator