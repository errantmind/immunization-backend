immunization-backend
====================

Immunization Backend - JSON RESTful Web API w/ Express.js, MongoDB

2013 Bill &amp; Melinda Gates Immunization App

## Backend API

### /login (Post)

* Request:
  * username
  * password
* Response:
  * status: "success" or "failure"
  * firstName?

### /logout (Post)
* Response:
  * status: "success" or "failure"

### /patients (Get)
Todo

### /patients/:id (Post)
Updates a patient's info
* Request:
  *  firstName
  *  middleName
  *  lastName
  *  birthYear
  *  birthMonth
  *  birthDay
  *  contactPhone
  *  contactEmail
* Response:
  * status: "success" or "failure"
  
### /search (Post)
* Request:
  *  firstName?
  *  middleName?
  *  lastName?
  *  birthYear?
  *  birthMonth?
  *  birthDay?
  *  contactPhone?
  *  contactEmail?
  *  _id?
* Response list:
  *  firstName
  *  middleName
  *  lastName
  *  birthYear
  *  birthMonth
  *  birthDay
  *  contactPhone
  *  contactEmail
  *  picture
  *  _id
 
### /populate (Get)
Reload the database (in case something bad happened).
