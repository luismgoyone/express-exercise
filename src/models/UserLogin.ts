import Db from "@connectors/Db"
import { UserCredentials } from "@utils/types/request"


export type UserLoginsFields = {
  user_id: number
  token: string
  last_login_at: string
  username: string
  password: string
}

class UserLogin {
  static async getBy(fields: Partial<UserLoginsFields>): Promise<UserLoginsFields> {
    const connector = Db.getInstance()

    const result = await connector('user_logins').where(fields).first()

    connector.destroy()
    console.log(result, 'whats happening heer: ')
    return result
  }

  static async register(data: Partial<UserLoginsFields>): Promise<UserLoginsFields> {
    const connector = Db.getInstance()

    const [result] = await connector('user_logins').insert(data).returning<UserLoginsFields[]>(['*'])

    connector.destroy()

    return result
  }

  static async validateUser(fields: Partial<UserLoginsFields>): Promise<UserLoginsFields> {
    const connector = Db.getInstance()

    const result = await connector('user_logins').select('username', 'password').where(fields).first()

    connector.destroy()

    return result
  }

  static async update(fields: Partial<UserLoginsFields>, conditions: Partial<UserLoginsFields>) {
    const connector = Db.getInstance()

    const [result] = await connector('user_logins').update(fields).where(conditions).returning<UserLoginsFields[]>(['*'])
 
    connector.destroy()

    return result
  }

  static async getUserInformation(id: number): Promise<UserCredentials> {
    const connector = Db.getInstance()

    const result = await connector('user_logins')
    .select(
      'users.id as id',
      'users.first_name as first_name',
      'users.last_name as last_name',
      'user_logins.username',
      'user_logins.token',
    )
    .innerJoin('users', 'user_logins.user_id', 'users.id')
    .where('users.id', id)
    .first()

    connector.destroy()

    return result
  }
}

export default UserLogin