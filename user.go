package main

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

// CREATE

// READ

// UPDATE

// DELETE
