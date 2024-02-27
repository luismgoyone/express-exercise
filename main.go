package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

var (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = os.Getenv("DBPASS")
	dbname   = "exercise_db"
)

var db *sql.DB

func main() {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		panic(err)
	}

	println("Connection Established!")

	router := gin.Default()

	router.POST("/register", createUserAccount)
	router.PATCH("/login", loginUserAccount)
	router.DELETE("/logout", logoutUserAccount)
	router.GET("/posts", getAllUserPosts)
	router.Run("localhost:8080")
}

type ErrorJson struct {
	Errors []string `json:"errors"`
}

func jsonifyErrors(errors []error) ErrorJson {
	var errorTexts []string
	for _, err := range errors {
		errorTexts = append(errorTexts, err.Error())
	}
	jsonErrors := ErrorJson{
		Errors: errorTexts,
	}

	return jsonErrors
}

// GET

func getAllUserPosts(c *gin.Context) {
	type UserPost struct {
		ID        int    `json:"id"`
		Content   string `json:"content"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Username  string `json:"username"`
	}
	var errs []error
	var getAllUserPostsReturn []UserPost

	token := c.GetHeader("Token")

	userId, err := getUserIdByToken(token)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusUnauthorized, jsonifyErrors(errs))
		panic(err)
	}

	userAccount, err := getUserAccountByUserId(userId)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusNotFound, jsonifyErrors(errs))
		panic(err)
	}

	posts, err := getAllUserPostsById(userId)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusNoContent, jsonifyErrors(errs))
		panic(err)
	}

	for _, post := range posts {
		userPost := UserPost{
			ID:        post.id,
			Content:   post.content,
			FirstName: userAccount.first_name,
			LastName:  userAccount.last_name,
			Username:  userAccount.username,
		}
		getAllUserPostsReturn = append(getAllUserPostsReturn, userPost)
	}

	c.IndentedJSON(http.StatusOK, getAllUserPostsReturn)
}

// POST

func createUserAccount(c *gin.Context) {
	type CreateUserAccountBody struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Password  string `json:"password"`
		Username  string `json:"username"`
	}

	type CreateUserAccountReturn struct {
		ID        int    `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Username  string `json:"username"`
	}

	var body CreateUserAccountBody
	var errs []error

	err := c.BindJSON(&body)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusBadRequest, jsonifyErrors(errs))
		panic(err)
	}

	var newUserAccount = UserAccount{
		User{
			first_name: body.FirstName,
			last_name:  body.LastName,
		},
		UserLogin{
			username: body.Username,
			password: body.Password,
		},
	}

	isUserAccountValid, errs := newUserAccount.isUserAccountValid()
	if !isUserAccountValid {
		c.IndentedJSON(http.StatusBadRequest, jsonifyErrors(errs))
		panic(errs)
	}

	err = checkUsernameDuplicates((&newUserAccount).username)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusConflict, jsonifyErrors(errs))
		panic(errs)
	}

	newUserAccount, err = addUserAccount(&newUserAccount)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusInternalServerError, jsonifyErrors(errs))
		panic(err)
	}

	createdUser := CreateUserAccountReturn{
		ID:        newUserAccount.id,
		FirstName: newUserAccount.first_name,
		LastName:  newUserAccount.last_name,
		Username:  newUserAccount.username,
	}

	c.IndentedJSON(http.StatusOK, createdUser)
}

// PATCH

func loginUserAccount(c *gin.Context) {
	type LoginUserAccountBody struct {
		Password string `json:"password"`
		Username string `json:"username"`
	}

	type LoginUserAccountReturn struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Password  string `json:"password"`
		Username  string `json:"username"`
		Token     string `json:"token"`
	}

	var body LoginUserAccountBody
	var errs []error

	err := c.BindJSON(&body)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusBadRequest, jsonifyErrors(errs))
		panic(err)
	}

	err = verifyUserLogin(body.Username, body.Password)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusBadRequest, jsonifyErrors(errs))
		panic(err)
	}

	err = addToken(body.Username)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusBadRequest, jsonifyErrors(errs))
		panic(err)
	}

	loggedInUserAccount, err := getUserAccountByUsername(body.Username)
	if err != nil {
		errs = append(errs, err)
		c.IndentedJSON(http.StatusInternalServerError, jsonifyErrors(errs))
		panic(err)
	}

	loginUserAccountReturn := LoginUserAccountReturn{
		FirstName: loggedInUserAccount.first_name,
		LastName:  loggedInUserAccount.last_name,
		Password:  loggedInUserAccount.password,
		Username:  loggedInUserAccount.username,
		Token:     loggedInUserAccount.token,
	}

	c.IndentedJSON(http.StatusOK, loginUserAccountReturn)
}

// DELETE

func logoutUserAccount(c *gin.Context) {
	type LogoutUserAccountReturn struct {
		Success bool     `json:"success"`
		Errors  []string `json:"errors"`
	}
	var errs []error

	token := c.GetHeader("Token")
	err := removeToken(token)

	var logoutUserAccountReturn LogoutUserAccountReturn

	if err != nil {
		errs = append(errs, err)

		logoutUserAccountReturn = LogoutUserAccountReturn{
			Success: false,
			Errors:  jsonifyErrors(errs).Errors,
		}
		c.IndentedJSON(http.StatusInternalServerError, logoutUserAccountReturn)
	}

	logoutUserAccountReturn = LogoutUserAccountReturn{
		Success: true,
		Errors:  jsonifyErrors(errs).Errors,
	}
	c.IndentedJSON(http.StatusOK, logoutUserAccountReturn)
}
