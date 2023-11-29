import Db from "@connectors/Db"


type UserLoginsFields = {
  user_id: number
  token: string
  last_login_at: string
  username: string
  password: string
}

class UserLogin {
  static async getVerified(fields: Partial<UserLoginsFields>): Promise<UserLoginsFields> {
    const connector = Db.getInstance()

    // returns if there is a match of the username
    const [result]  = await connector('user_logins').select('username').where(fields)

    console.log(result, ' is the username from db')

    connector.destroy()
    return result
  }

  static async register(data: Partial<UserLoginsFields>) {
    const connector = Db.getInstance()

    const [result] = await connector('user_logins').insert(data).returning<UserLoginsFields[]>(['*'])

    connector.destroy()

    return result
  }
}

export default UserLogin