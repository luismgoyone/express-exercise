import Db from "@connectors/Db"


export type UserLoginsFields = {
  user_id: number
  token: string
  last_login_at: string
  username: string
  password: string
}

class UserLogin {
  static async getVerified(fields: Partial<UserLoginsFields>) {
    const connector = Db.getInstance()
    try {
      // returns if there is a match for the username
      const result = await connector('user_logins').select('username').where(fields)
    
      if (result.length > 0) {
        console.log(`${fields.username} already exists in the database`)
        // You may want to throw an error, return a specific value, or handle this case accordingly
        // For example, you could throw an error: throw new Error('Username already exists');
      } else {
        console.log(`${fields.username} is available`)
      }
    
      return result
    } catch (error) {
      console.error('Error checking username:', error);
      throw error; // Propagate the error to the caller
    }
  }

  static async register(data: Partial<UserLoginsFields>): Promise<UserLoginsFields> {
    const connector = Db.getInstance()

    const [result] = await connector('user_logins').insert(data).returning<UserLoginsFields[]>(['*'])

    connector.destroy()

    return result
  }
}

export default UserLogin