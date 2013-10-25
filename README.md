immunization-backend
====================

Immunization Backend - JSON RESTful Web API w/ Express.js, MongoDB

2013 Bill &amp; Melinda Gates Immunization App

## Backend API

### Fields in Sample Patient Data
* firstName
* middleName
* lastName
* birthYear
* birthMonth
* birthDay
* gender
* contactPhone
* contactEmail
* contactStreetAddress
* contactCity
* contactState
* contactZip
* contactCountry
* picture
* bloodType
* alergies
* diseaseHistory
* notes

### /login (Post)

* Request:
  * username
  * password
* Response:
  * status: "success" or "failure"
  * firstName: <firstName>

### /logout (Post)
* Response:
  * status: "success" or "failure"

### /patients (Get)
Retrieves all patients
* Response:
  * < array of all patients >

### /patients/:id (Get)
Finds a particular patient
* Response:
  * if patient found: <patient>
  * if patient not found: status: "failure"

### /patients/:id (Post)
Updates a patient's info
* Request: <fields to change>
* Response:
  * status: "success" or "failure"
  
### /search (Post)
* Request:
  * <fields to match on>
* Response list:
  * <array of matched patients>
 
### /populate (Get)
* Reload the database in case something bad happened. Note, no authentication is required for this, meaning the database can be reset with a web browser.
