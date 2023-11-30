package main

import "fmt"

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
		errMsg := fmt.Sprintf("First name must not exceed %v characters", maxCharLength)
		return false, errMsg
	}
	return true, ""
}

func (user *User) isLastNameValid() (bool, string) {
	const maxCharLength = 20
	if len(user.last_name) > maxCharLength {
		errMsg := fmt.Sprintf("Last name must not exceed %v characters", maxCharLength)
		return false, errMsg
	}
	return true, ""
}

func (user *User) isUserValid() (bool, []string) {
	errors := []string{}
	isUserValid := true
	isFnValid, fnErr := user.isFirstNameValid()
	isLnValid, lnErr := user.isLastNameValid()
	if !isFnValid {
		errors = append(errors, fnErr)
		isUserValid = isFnValid
	}
	if !isLnValid {
		errors = append(errors, lnErr)
		isUserValid = isLnValid
	}
	return isUserValid, errors
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
	const maxCharLength = 20
	if len(user_login.username) > maxCharLength {
		errMsg := fmt.Sprintf("User name must not exceed %v characters", maxCharLength)
		return false, errMsg
	}
	return true, ""
}

func (user_login *UserLogin) isPasswordValid() (bool, string) {
	const maxCharLength = 20
	const minCharLength = 8
	if len(user_login.password) > maxCharLength {
		errMsg := fmt.Sprintf("Password must not exceed %v characters", maxCharLength)
		return false, errMsg
	}
	if len(user_login.password) < minCharLength {
		errMsg := fmt.Sprintf("Password must be at least %v characters", minCharLength)
		return false, errMsg
	}
	return true, ""
}

func (user_login *UserLogin) isUserLoginValid() (bool, []string) {
	errors := []string{}
	isUserLoginValid := true
	isUnValid, unErr := user_login.isUsernameValid()
	isPwValid, pwErr := user_login.isPasswordValid()
	if !isUnValid {
		errors = append(errors, unErr)
		isUserLoginValid = isUnValid
	}
	if !isPwValid {
		errors = append(errors, pwErr)
		isUserLoginValid = isPwValid
	}
	return isUserLoginValid, errors
}

// USER ACCOUNT

type UserAccount struct {
	User
	UserLogin
}

func (user_account *UserAccount) isUserAccountValid() (bool, []string) {
	errors := []string{}
	isAccValid := true

	isUserValid, userErr := user_account.isUserValid()
	isUserLoginValid, loginErr := user_account.isUserLoginValid()

	if !isUserValid {
		errors = append(errors, userErr...)
		isAccValid = isUserValid
	}
	if !isUserLoginValid {
		errors = append(errors, loginErr...)
		isAccValid = isUserLoginValid
	}

	return isAccValid, errors
}
