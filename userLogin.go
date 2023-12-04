package main

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
		panic(err)
	}
	return user_id, err
}

// READ

// UPDATE

// DELETE
