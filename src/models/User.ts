import Db from '@connectors/Db'

type UserFields = {
  id: number
  first_name: string
  last_name: string
}
class User {
  static async register(data: Partial<UserFields>) {
    const connector = Db.getInstance()


    connector.destroy()
  } 


  static async insert(data: Partial<UserFields>) {
    const connector = Db.getInstance()

    // const [resultUser, resultUserLogin ] = await Promise.all([
    //   connector('user').insert(),
    //   connector('user_login')
    // ])

    connector.destroy()
  }
}

export default User

