package main

// POST

type Posts struct {
	id         int
	user_id    int
	content    string
	created_at string
}

//USER

type User struct {
	id         int
	first_name string // Max 20 chars
	last_name  string // Max 20 chars
}

func (user *User) isFirstNameValid() bool {
	const maxCharLength = 20
	if len(user.first_name) > maxCharLength {
		return false
	}
	return true
}

func (user *User) isLastNameValid() bool {
	const maxCharLength = 20
	if len(user.last_name) > maxCharLength {
		return false
	}
	return true
}

// USER LOGIN

type UserLogin struct {
	user_id       int
	token         string
	last_login_at string
	username      string // Max 20 chars
	password      string // Min 8 chars, Max 20 chars
}

func (user_login *UserLogin) isUsernameValid() bool {
	if len(user_login.username) > 20 {
		return false
	}
	return true
}

func (user_login *UserLogin) isPasswordValid() bool {
	if len(user_login.password) > 20 ||
		len(user_login.password) < 8 {
		return false
	}
	return true
}

// USER ACCOUNT

type UserAccount struct {
	User
	UserLogin
}

func (user_account *UserAccount) isUserAccountValid() bool {
	if user_account.isFirstNameValid() &&
		user_account.isLastNameValid() &&
		user_account.isPasswordValid() &&
		user_account.isUserAccountValid() {
		return true
	}
	return false
}
