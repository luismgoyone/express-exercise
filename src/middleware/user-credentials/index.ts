import UserLogin from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegisterType } from '@utils/types/request'
import { NextFunction, Response } from 'express'

const userCrendentialValidator = async (request: ExpressCustomRequest<UserRegisterType> , response: Response, next: NextFunction) => {

  const { username, password } = request.body

  const doesUsernameExist = await UserLogin.checkUsernameExist({ username })

  if(!doesUsernameExist) {
    return response.status(409).send({ "error": "username is does not exist!" })
  }

  const result = await UserLogin.validate({ username, password })

  if(!result) {
    return response.status(409).send({ "error": "username is does not match with password!" })
  }

  next()
}

export default userCrendentialValidator