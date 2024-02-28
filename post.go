package main

// CREATE

// READ
func getAllPostsWithUserAccount() ([]PostWithUserAccount, error) {
	var posts []PostWithUserAccount

	sqlStatement := `
		SELECT
			posts.id,
			posts.content,
			posts.user_id
			users.first_name,
			users.last_name,
			user_logins.username,
		FROM posts
		JOIN
			user_logins
		ON
			user_id = user_id
		JOIN
			users
		ON
			user_id = id
	`
	rows, err := db.Query(sqlStatement)
	if err != nil {
		return posts, err
	}

	rows.Scan(&posts)

	return posts, err
}

func getAllUserPostsById(user_id int) ([]Posts, error) {
	var posts []Posts

	sqlStatement := `
		SELECT
			id,
			content
		FROM posts
		WHERE user_id=$1
	`
	rows, err := db.Query(sqlStatement, user_id)
	if err != nil {
		return posts, err
	}

	rows.Scan(&posts)

	return posts, err

}

// UPDATE

// DELETE
