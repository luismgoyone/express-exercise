import express, { Router, Request, Response } from 'express'
import usernameValidator from '@middleware/username'
import passwordValidator from '@middleware/password'
import { UserRegister } from '@utils/types/register'
import ExpressCustomRequest from '@utils/types/express-request'
import UserLogin from '@models/UserLogin'
import User from '@models/User'

const routes = Router()

// note to self: same with fastify, (url, prehandler*middlware*, handler)
const requestsValidator = [usernameValidator, passwordValidator]

routes.post('/register', requestsValidator, async (request: ExpressCustomRequest<UserRegister>, response: Response) => {
  const { username, first_name, last_name, password } = request.body

  const { id: user_id, first_name: firstName, last_name: lastName } = await User.register({ first_name, last_name })

  const { username: userName} = await UserLogin.register({ user_id, username, password })


  return response.status(200).send({
    id: user_id,
    first_name: firstName,
    last_name: lastName,
    username: userName
  })
}) 

export default routes