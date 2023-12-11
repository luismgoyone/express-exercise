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

	router.POST("/register", postUserAccount)
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

// POST

func postUserAccount(c *gin.Context) {
	type PostUserBody struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Password  string `json:"password"`
		Username  string `json:"username"`
	}

	type PostUserReturn struct {
		ID        int    `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Username  string `json:"username"`
	}

	var body PostUserBody
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

	createdUser := PostUserReturn{
		ID:        newUserAccount.id,
		FirstName: newUserAccount.first_name,
		LastName:  newUserAccount.last_name,
		Username:  newUserAccount.username,
	}

	c.IndentedJSON(http.StatusOK, createdUser)
}
