import Db from "@connectors/Db"


export type UserLoginsFields = {
  user_id: number
  token: string
  last_login_at: string
  username: string
  password: string
}

class UserLogin {
  static async checkUsernameExist(fields: Partial<UserLoginsFields>): Promise<boolean> {
    const connector = Db.getInstance()

      // returns if there is a match for the username
      const rows = await connector('user_logins').select('username').where(fields)

      const result =!!rows

      connector.destroy()

      return result
  }

  static async register(data: Partial<UserLoginsFields>): Promise<UserLoginsFields> {
    const connector = Db.getInstance()

    const [result] = await connector('user_logins').insert(data).returning<UserLoginsFields[]>(['*'])

    connector.destroy()

    return result
  }

  static async validate(fields: Partial<UserLoginsFields>): Promise<boolean> {
    const connector = Db.getInstance()

    const rows = await connector('user_logins').select('username', 'password').where(fields).first()

    const result = !!rows

    connector.destroy()

    return result
  }

  static async update(fields: Partial<UserLoginsFields>, conditions: Partial<UserLoginsFields>) {
    const connector = Db.getInstance()

    const result = await connector('user_logins').update(fields).where(conditions)
    
    connector.destroy()

    return result
  }

}

export default UserLogin