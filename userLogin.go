package main

import (
	"fmt"
	"time"
)

// CREATE

func insertUserLogin(userLogin UserLogin) (int, error) {
	sqlStatement := `
	INSERT INTO user_logins (user_id, username, password)
	VALUES ($1, $2, $3)
	RETURNING user_id`
	var user_id int
	hashedPassword, _ := hashPassword(userLogin.password)
	row := db.QueryRow(sqlStatement, userLogin.user_id, userLogin.username, hashedPassword)
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

func verifyUserLogin(username string, password string) error {
	var userLogin UserLogin
	sqlStatement := `
		SELECT password
		FROM user_logins
		WHERE username=$1
	`
	row := db.QueryRow(sqlStatement, username)
	err := row.Scan(&userLogin.password)
	noResultsError := "sql: no rows in result set"

	if err != nil && err.Error() == noResultsError {
		return fmt.Errorf("No account with the username '%v' found", username)
	}
	if err != nil {
		return fmt.Errorf("userLogin: %v", err)
	}
	isPasswordCorrect := checkPasswordHash(password, userLogin.password)
	if !isPasswordCorrect {
		return fmt.Errorf("Username or password is incorrect")
	}

	return nil
}

func findToken(token string) error {
	var matchingToken string
	sqlStatement := `
		SELECT token
		FROM user_logins
		WHERE token=$1
	`
	row := db.QueryRow(sqlStatement, token)
	err := row.Scan(&matchingToken)
	noResultsError := "sql: no rows in result set"

	if err != nil && err.Error() == noResultsError {
		return fmt.Errorf("Unauthorized user! This machine will self destruct in 3... 2... 1... *BOOM*")
	}
	if err != nil {
		return fmt.Errorf("findToken: %v", err)
	}
	if token != matchingToken {
		return fmt.Errorf("Wait, what? You got past the error checkers with non-matching tokens?!")
	}

	return nil
}

// UPDATE

func addToken(username string) error {
	var userId int
	newToken := generateSecureToken(64)
	tz, _ := time.LoadLocation("Asia/Manila")
	now := time.Now().In(tz).Format("2006-01-02T15:04:05 -07:00:00")
	sqlStatement := `
		UPDATE user_logins
		SET token=$1,
				last_login_at=$2
		WHERE username=$3
		RETURNING user_id
	`
	row := db.QueryRow(sqlStatement, newToken, now, username)
	err := row.Scan(&userId)
	if err != nil {
		return fmt.Errorf("addToken: %v", err)
	}
	return err
}

func removeToken(token string) error {
	err := findToken(token)
	if err != nil {
		return err
	}

	sqlStatement := `
		UPDATE user_logins
		SET token=null
		WHERE token=$1
	`
	row := db.QueryRow(sqlStatement, token)
	err = row.Err()
	if err != nil {
		return fmt.Errorf("removeToken: %v", err)
	}

	return nil
}

// DELETE
