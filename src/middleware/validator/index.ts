import UserLogin from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegisterType } from '@utils/types/request'
import { NextFunction, Response } from 'express'

const registerValidator = async (request: ExpressCustomRequest<UserRegisterType> , response: Response, next: NextFunction) => {

  const { username, password } = request.body

  if(!username || username.length < 8) {
    return response.status(400).send({ "error": "username is less than 8 characters!" })
  }

  if(!password || password.length < 8) {
    return response.status(400).send({ "error": "password is less than 8 characters!" })
  }

  const isUsernameTaken = await UserLogin.checkUsernameExist({ username })

  if(isUsernameTaken) {
    return response.status(409).send({ "error": "username is already exist!" })
  }

  next()

}

export default registerValidator