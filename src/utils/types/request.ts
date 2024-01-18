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

export type { UserLoginType, UserRegisterType }

