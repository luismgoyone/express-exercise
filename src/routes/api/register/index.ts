import express, { Router, Request, Response } from 'express'
import usernameValidator from '@middleware/username'
import passwordValidator from '@middleware/password'
import { UserRegister } from '@utils/types/register'
import ExpressCustomRequest from '@utils/types/express-request'

const routes = Router()

// note to self: same with fastify, (url, prehandler*middlware*, handler)
const requestsValidator = [usernameValidator, passwordValidator]

routes.post('/register', requestsValidator, (request: ExpressCustomRequest<UserRegister>, response: Response) => {
  const { username, first_name, last_name, password } = request.body

  // insert into users and user_logins tables
  
  response.status(200).send('everything is okay')
}) 

export default routes