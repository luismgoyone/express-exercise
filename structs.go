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

func (user *User) isFirstNameValid() (bool, string) {
	const maxCharLength = 20
	if len(user.first_name) > maxCharLength {
		return false, "First name must not exceed 20 characters"
	}
	return true, ""
}

func (user *User) isLastNameValid() (bool, string) {
	const maxCharLength = 20
	if len(user.last_name) > maxCharLength {
		return false, "Last name must not exceed 20 characters"
	}
	return true, ""
}

// USER LOGIN

type UserLogin struct {
	user_id       int
	token         string
	last_login_at string
	username      string // Max 20 chars
	password      string // Min 8 chars, Max 20 chars
}

func (user_login *UserLogin) isUsernameValid() (bool, string) {
	if len(user_login.username) > 20 {
		return false, "User name must not exceed 20 characters"
	}
	return true, ""
}

func (user_login *UserLogin) isPasswordValid() (bool, string) {
	if len(user_login.password) > 20 {
		return false, "Password must not exceed 20 characters"
	}
	if len(user_login.password) < 8 {
		return false, "Password must be at least 8 characters"
	}
	return true, ""
}

// USER ACCOUNT

type UserAccount struct {
	User
	UserLogin
}

func (user_account *UserAccount) isUserAccountValid() (bool, []string) {
	errors := []string{}
	isAccValid := true

	isFnValid, fnErr := user_account.isFirstNameValid()
	isLnValid, lnErr := user_account.isLastNameValid()
	isUnValid, unErr := user_account.isUsernameValid()
	isPwValid, pwErr := user_account.isPasswordValid()

	if !isFnValid {
		errors = append(errors, fnErr)
		isAccValid = isFnValid
	}
	if !isLnValid {
		errors = append(errors, lnErr)
		isAccValid = isLnValid
	}
	if !isUnValid {
		errors = append(errors, unErr)
		isAccValid = isUnValid
	}
	if !isPwValid {
		errors = append(errors, pwErr)
		isAccValid = isPwValid
	}

	return isAccValid, errors
}
