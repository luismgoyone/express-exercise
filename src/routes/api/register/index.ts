import validator from '@middleware/validator'
import User from '@models/User'
import UserLogin from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegister } from '@utils/types/register'
import { Response, Router } from 'express'
const routes = Router()

routes.post('/register', validator, async (request: ExpressCustomRequest<UserRegister>, response: Response) => {
  const { username, first_name, last_name, password } = request.body


  // create user 
  const { id } = await User.create({first_name, last_name})  

  // create user login
  const user = await UserLogin.register({user_id: id, username, password })
  
  // return user
  const result = 'test'
  // const result = await User.getById({ id, first_name, last_name })


  return response.status(200).send(result)
}) 

export default routes