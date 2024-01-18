import validator from '@middleware/validator'
import User from '@models/User'
import UserLogin from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegisterType } from '@utils/types/request'
import { Response, Router } from 'express'

const routes = Router()

routes.post('/register', validator, async (request: ExpressCustomRequest<UserRegisterType>, response: Response) => {
  const { username, first_name, last_name, password } = request.body


  // create user 
  const { id } = await User.create({ first_name, last_name })  

  // create user login
  await UserLogin.register({ user_id: id, username, password })
  
  // return user
  const result = await User.getById(id)


  return response.status(200).send(result)
}) 

export default routes