package main

import "fmt"

func getUserAccount(userId int) (UserAccount, error) {
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
