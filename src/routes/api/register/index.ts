import registerValidation from '@middleware/register-validation'
import User from '@models/User'
import UserLogin from '@models/UserLogin'
import ExpressCustomRequest from '@utils/types/express-request'
import { UserRegisterType } from '@utils/types/request'
import { Response, Router } from 'express'

const routes = Router()

routes.post('/register', registerValidation, async (request: ExpressCustomRequest<UserRegisterType>, response: Response) => {
  const { username, first_name, last_name, password } = request.body

  const { id } = await User.create({ first_name, last_name })  

  await UserLogin.register({ user_id: id, username, password })
  
  const result = await User.getById(id)

  return response.status(200).send(result)
}) 

export default routes