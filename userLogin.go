package main

import "fmt"

// CREATE

func insertUserLogin(userLogin UserLogin) (int, error) {
	sqlStatement := `
	INSERT INTO user_logins (user_id, username, password)
	VALUES ($1, $2, $3)
	RETURNING user_id`
	var user_id int
	row := db.QueryRow(sqlStatement, userLogin.user_id, userLogin.username, userLogin.password)
	err := row.Scan(&user_id)
	if err != nil {
		return 0, fmt.Errorf("insertUserLogin: %v", err)
	}
	return user_id, err
}

// READ

func checkUsernameDuplicates(newUsername string) error {

	var username string
	var errMsg error = nil
	noDuplicatesError := "sql: no rows in result set"
	sqlStatement := `
		SELECT username
		FROM user_logins
		WHERE username=$1
	`
	row := db.QueryRow(sqlStatement, newUsername)
	err := row.Scan(&username)

	if err != nil && err.Error() != noDuplicatesError {
		errMsg = fmt.Errorf("checkUsernameDuplicates: %v", err)
	}

	if newUsername == username {
		errMsg = fmt.Errorf("The username '%v' is already taken", newUsername)
	}

	return errMsg
}

// UPDATE

// DELETE
