type UserRegisterType = {
  first_name: string
  last_name: string
  username: string
  password: string
}

type UserLoginType = {
  username: string
  password: string
}

type UserCredentials = {
  id: number
  first_name: string
  last_name: string
  username: string
  token: string
}

export type { UserCredentials, UserLoginType, UserRegisterType }

