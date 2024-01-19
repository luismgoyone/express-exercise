import UserLogin from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegisterType } from '@utils/types/request'
import { NextFunction, Response } from 'express'

const usernameAuthentication = async (request: ExpressCustomRequest<UserRegisterType> , response: Response, next: NextFunction) => {
  const { username, password } = request.body

  if(!username) {
    return response.status(409).send({ "error": "invalid username!" })
  }

  const usernameExist = await UserLogin.getBy({ username })

  if(!usernameExist) {
    return response.status(409).send({ "error": "username is does not exist!" })
  }

  const { user_id } = usernameExist

  const result = await UserLogin.validateUser({ username, password })
  
  response.locals.id = user_id

  if(!result) {
    return response.status(409).send({ "error": "username is does not match with password!" })
  }

  next()
}

export default usernameAuthentication
