import User from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegister } from '@utils/types/register'
import { NextFunction, Response } from 'express'

// note to self: - Request<P = core.ParamsDictionary, ResBody = any, ReqBody = any>
const usernameValidator = async (request: ExpressCustomRequest<UserRegister> , response: Response, next: NextFunction) => {
  const { username, password } = request.body

  if(!username || username.length < 8) {
    return response.status(400).send('password is less than 8 characters!')
  }

  if(!password || password.length < 8) {
    return response.status(400).send('password is less than 8 characters!')
  }
  console.log("REQUEST IN MIDDLEWARE ")
  const isUsernameTaken = await User.getVerified({ username })

  if(isUsernameTaken) {
    return response.status(409).send('username is already taken!')
  }

  next()
}

export default usernameValidator