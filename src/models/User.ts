import Db from '@connectors/Db'
import { UserLoginsFields } from './UserLogin'

type UserFields = {
  id: number
  first_name: string
  last_name: string
}

type UserCredentials = UserFields & UserLoginsFields

class User {
  static async create(data: Partial<UserFields>) {
    const connector = Db.getInstance()

    const [result] = await connector('users').insert(data).returning<UserFields[]>(['*'])

    connector.destroy()

    return result
  }

  static async getById(id: number): Promise<UserCredentials> {
    const connector = Db.getInstance()

    const result = await connector('users')
    .select('users.id', 'users.first_name', 'users.last_name', 'user_logins.username')
    .join('user_logins', 'users.id', 'user_logins.user_id')
    .where('users.id', id)
    .first()

    connector.destroy()

    return result
  }
}

export default User

