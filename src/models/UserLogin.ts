import Db from "@connectors/Db"


type UserLoginsFields = {
  user_id: number
  token: string
  last_login_at: string
  username: string
  password: string
}

class UserLogin {
  static async getVerified(fields: Partial<UserLoginsFields>): Promise<string | undefined> {
    const connector = Db.getInstance()

    const [{ result }]  = await connector('user_logins').where(fields).select('username')

    console.log(result, ' is the username from db')

    connector.destroy()
    return result 
  }
}

export default UserLogin