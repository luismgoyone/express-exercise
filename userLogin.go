package main

type UserLogin struct {
	user_id       int
	token         string
	last_login_at string
	username      string // Max 20 chars
	password      string // Max 20 chars
}

func (user_login *UserLogin) isUsernameValid() bool {
	if len(user_login.username) > 20 {
		return false
	}
	return true
}

func (user_login *UserLogin) isPasswordValid() bool {
	if len(user_login.password) > 20 {
		return false
	}
	return true
}

// CREATE

// READ

// UPDATE

// DELETE
