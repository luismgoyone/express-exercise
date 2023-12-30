package main

import "fmt"

// CREATE

func addUserAccount(userAccount *UserAccount) (UserAccount, error) {
	userId, err := insertUser(userAccount.User)
	if err != nil {
		return *userAccount, err
	}
	userAccount.id = userId
	userAccount.user_id = userId

	userLoginId, err := insertUserLogin(userAccount.UserLogin)
	if err != nil {
		return *userAccount, err
	}

	newUserAccount, err := getUserAccountByUserId(userId)
	if err != nil {
		fmt.Print(userId, userLoginId, userAccount.id, userAccount.user_id)
		return *userAccount, err
	}

	return newUserAccount, nil
}

// READ

func getUserAccountByUserId(userId int) (UserAccount, error) {
	var userAccount UserAccount
	sqlStatement := `
		SELECT
			id,
			first_name,
			last_name,
			username
		FROM
			users
		INNER JOIN
			user_logins
		ON
			id = user_id
		WHERE
			id = $1
	`
	row := db.QueryRow(sqlStatement, userId)
	err := row.Scan(&userAccount.id, &userAccount.first_name, &userAccount.last_name, &userAccount.username)
	if err != nil {
		return userAccount, fmt.Errorf("getUserAccount: %v", err)
	}
	return userAccount, nil
}
