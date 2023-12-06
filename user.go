package main

import "fmt"

// CREATE

func insertUser(user User) (int, error) {
	sqlStatement := `
	INSERT INTO users (first_name, last_name)
	VALUES ($1, $2)
	RETURNING id`
	var id int
	row := db.QueryRow(sqlStatement, user.first_name, user.last_name)
	err := row.Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("insertUser: %v", err)
	}
	return id, err
}

// READ

// UPDATE

// DELETE
