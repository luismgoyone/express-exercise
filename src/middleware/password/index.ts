import express, { Request, Response, NextFunction} from 'express'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegister } from '@utils/types/register'
//  - just destructure it from generics
const passwordValidator = async (request: ExpressCustomRequest<UserRegister>, response: Response, next: NextFunction) => {
  const { password } = request.body

  if(!password || password.length < 8) {
    return response.status(500).send('password is less than 8 characters!')
  }

  next()
}

export default passwordValidator