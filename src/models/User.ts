import Db from '@connectors/Db'

type UserFields = {
  id: number
  first_name: string
  last_name: string
}
class User {
  static async register(data: Partial<UserFields>) {
    const connector = Db.getInstance()

    const [result] = await connector('users').insert(data).returning<UserFields[]>(['*'])

    connector.destroy()
    return result
  }  
}

export default User

