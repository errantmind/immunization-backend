"use strict";

exports.Patients = function() {
  var MongoLib = require('mongodb'),
    MongoServer,
    MongoDB,
    BSON = MongoLib.BSONPure,
    server,
    db,
    SendEmailLib = require("../email.js");

  this.initDB = function() {
    MongoServer = MongoLib.Server;
    MongoDB = MongoLib.Db;
    var mongoUri = process.env.MONGOLAB_URI ||
      process.env.MONGOHQ_URL ||
      'mongodb://localhost/patientdb';

    console.log('DB URL: ' + mongoUri);
    MongoLib.connect(mongoUri, {}, function dbConnectCallback(error, database) {
      db = database;
      db.addListener("error", function handleError(error) {
        console.log("Error connecting to MongoLab");
      });

      /*
      db.createCollection("patients", function collectionCallback(error, collection) {
        console.log("Removing all records from 'patients'");
        db.collection('patients', function(err, collection) {
          collection.remove({}, {}, function(err, result) {});
        });

        console.log("Inserting sample patients");
        db.collection('patients', function(err, collection) {
          collection.insert(getSamplePatients(), {
            safe: true
          }, function(err, result) {});
        });
      });
      */
    });
  };

  this.populate = function(req, res) {
    db.createCollection("patients", function collectionCallback(error, collection) {
      console.log("Created Collection 'patients'");
      db.collection('patients', function(err, collection) {
        collection.remove({}, {}, function(err, result) {
          console.log("Inserting sample patients");
          db.collection('patients', function(err, collection) {
            collection.insert(getSamplePatients(), {
              safe: true
            }, function(err, result) {
              res.send(JSON.stringify({
                status: 'success'
              }));
            });
          });
        });
      });
    });
  };

  this.thisIsAPI = function(req, res) {
    res.send('<html><body><h2> Immunization App API </h2> </br>Hello, this is an API that was developed to serve up patient records to an iPad app.  For more information, check it out on <a href="http://www.github.com/errantmind/immunization-backend">github</a>.</body></html>');
  };

  this.login = function(req, res) {
    res.header("Content-Type", "application/json");
    var post = req.body;

    if (post && post.username && post.password) {
      var user = authenticateUser(post.username, post.password);
      if (user) {
        req.session.user_id = post.username;
        res.send(JSON.stringify({
          status: 'success',
          firstName: user.firstName
        }));
      } else {
        res.send(JSON.stringify({
          status: 'failure'
        }));
      }
    } else {
      res.send(JSON.stringify({
        status: 'failure',
        message: 'Problem with Post'
      }));
    }
  };

  this.logout = function(req, res) {
    res.header("Content-Type", "application/json");
    delete req.session.user_id;
    res.send(JSON.stringify({
      status: "success"
    }));
  };

  this.findAllPatients = function(req, res) {
    res.header("Content-Type", "application/json");
    db.collection('patients', function(err, collection) {
      collection.find().toArray(function(err, items) {
        res.send(sanitizeRecords(items));
      });
    });
  };

  this.findPatientById = function(req, res) {
    res.header("Content-Type", "application/json");
    var id = req.params.id;
    console.log('Retrieving Patient Record for ID: ' + id);
    db.collection('patients', function(err, collection) {
      collection.findOne({
        _id: new BSON.ObjectID(id)
      }, function(err, item) {
        if (err) {
          res.send(JSON.stringify({
            status: "failure"
          }));
        } else if (item) {
          res.send(sanitizeRecords(item));
        }
      });
    });
  };

  this.addPatient = function(req, res) {
    res.header("Content-Type", "application/json");
    var patient = req.body;
    console.log('Adding Patient: ' + JSON.stringify(patient));
    db.collection('patients', function(err, collection) {
      collection.insert(patient, {
        safe: true
      }, function(err, result) {
        if (err) {
          res.send(JSON.stringify({
            status: 'failure'
          }));
        } else {
          console.log('Success: ' + JSON.stringify(result[0]));
          res.send(JSON.stringify({
            status: 'success'
          }));
        }
      });
    });
  };

  this.updatePatient = function(req, res) {
    res.header("Content-Type", "application/json");
    var id = req.params.id;
    var patient = req.body;

    var badFormInfo = validatePatientUpdateRequest(patient);
    if (badFormInfo) {
      res.send(JSON.stringify({
        status: "failure",
        validateMsg: badFormInfo
      }));
      return;
    }

    db.collection('patients', function(err, collection) {
      collection.findOne({
        _id: new BSON.ObjectID(id)
      }, function(err, item) {
        if (err) {
          console.log('failed to fetch patient in update patient!');
        } else if (item) {
          for (var key in patient) {
            item[key] = patient[key];
          }
          console.log('Updating Patient: ' + id);
          collection.update({
            '_id': new BSON.ObjectID(id)
          }, item, {
            safe: true
          }, function(err, result) {
            if (err) {
              console.log('Error updating patient: ' + err);
              res.send(JSON.stringify({
                status: 'failure',
                message: 'An error has occurred'
              }));

            } else {
              console.log('' + result + ' document(s) updated');
              res.send(JSON.stringify({
                status: 'success'
              }));
            }
          });
        }
      });
    });
  };

  this.deletePatient = function(req, res) {
    res.header("Content-Type", "application/json");
    var id = req.params.id;
    console.log('Deleting Patient: ' + id);
    db.collection('patients', function(err, collection) {
      collection.remove({
        '_id': new BSON.ObjectID(id)
      }, {
        safe: true
      }, function(err, result) {
        if (err) {
          res.send(JSON.stringify({
            status: 'failure'
          }));
        } else {
          console.log('' + result + ' document(s) deleted');
          res.send(JSON.stringify({
            status: 'success'
          }));
        }
      });
    });
  };

  var validatePatientUpdateRequest = function(patient) {

    for (var key in patient) {
      if (key === "contactState") {
        if (!(/^[A-Z]{2}$/).test(patient[key]))
          return "State";
      }
      if (key === "contactZip") {
        if (!(/^\d{5}$/).test(patient[key]))
          return "Zip Code";
      }
      if (key === "contactPhone") {
        if (!(/^\d{3}-\d{3}-\d{4}$/).test(patient[key]))
          return "Phone Number";
      }
      if (key === "contactEmail") {
        if (!(/^\S+@\S+\.\S+$/).test(patient[key]))
          return "Email Address";
      }
      if ((/Name/g).test(key)) {
        if (!(/^[a-zA-Z]+[a-zA-Z. ]*$/).test(patient[key]))
          return key;
      }
      if ((/Administered/g).test(key)) {
        if (patient[key])
          if (!(/^[a-zA-Z]+[a-zA-Z. ]*$/).test(patient[key]))
            return key;
      }
      if ((/Date/g).test(key) || (/Next/g).test(key)) {
        if (patient[key])
          if (!(/^\d{2}\/\d{2}\/\d{4}$/).test(patient[key]))
            return key;
      }
    }
  };



  this.searchPatient = function(req, res) {
    res.header("Content-Type", "application/json");
    var search = req.body;

    for (var key in search) {
      if (search[key] === "") {
        delete search[key];
      } else if (key === "_id") {
        search[key] = new BSON.ObjectID(search[key]);
      }
    }

    console.log('Searching For Patient: ' + JSON.stringify(search));
    db.collection('patients', function(err, collection) {
      collection.find(search).toArray(function(err, patientRecords) {
        if (err) {
          res.send(JSON.stringify({
            status: "failure"
          }));
        } else {
          res.send(sanitizeRecords(patientRecords));
        }
      });
    });
  };

  var sanitizeRecords = function(userRecord) {
    if (userRecord[0]) {
      for (var i = 0; i < Object.keys(userRecord).length; ++i) {
        delete userRecord[i]['userName'];
        delete userRecord[i]['password'];
      }

    } else {
      delete userRecord['userName'];
      delete userRecord['password'];
    }
    return userRecord;
  };


  this.checkAuth = function(req, res, next) {
    res.header("Content-Type", "application/json");
    if (req.session.user_id) {
      res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      next();
    } else {
      console.log('Failure: ' + req.session.user_id);
      res.send(JSON.stringify({
        status: 'failure',
        message: 'You are not authorized to view this page'
      }));
    }
  };

  var authenticateUser = function(username, password) {
    for (var user in privilegedUsers) {
      if (privilegedUsers[user].username === username && privilegedUsers[user].password === password)
        return privilegedUsers[user];
    }
    return null;
  };

  var privilegedUsers = [{
    firstName: "Betty",
    lastName: "Crocker",
    username: "betty@gmail.com",
    password: "test"
  }];

  var getSamplePatients = function() {

    var patients = [{
      id: "1",
      userName: "arnold",
      password: "thepump",
      firstName: "Arnold",
      middleName: "Alois",
      lastName: "Schwarzenegger",
      fatherFullName: "Gustav Schwarzenegger",
      motherFullName: "Aurelia Schwarzenegger",
      motherMaidenName: "Peach",
      birthYear: "1963",
      birthMonth: "11",
      birthDay: "22",
      gender: "Male",
      contactPhone: "281-555-1234",
      contactEmail: "arnold.schwarzenegger@gmail.com",
      contactStreetAddress: "3110 Main Street",
      contactCity: "Santa Monica",
      contactState: "CA",
      contactZip: "90405",
      contactCountry: "USA",
      picture: "arnold1.jpg",
      vacPicture: "",
      bloodType: "A-",
      alergies: "Bees and Wasps",
      diseaseHistory: "Chicken Pox at age 4",
      notes: "Steroid use, possible damage to liver",
      BirthBcgDate: '11/24/1963',
      BirthBcgAdministered: 'Jony Java',
      BirthBcgHospital: 'United Childrens',
      BirthBcgNext: '11/30/1963'
    }, {
      id: "2",
      userName: "mary",
      password: "password",
      firstName: "Mary",
      middleName: "Ann",
      lastName: "Whistler",
      fatherFullName: "Michael Whistler",
      motherFullName: "Cleopatra Whistler",
      motherMaidenName: "Berry",
      birthYear: "1997",
      birthMonth: "3",
      birthDay: "2",
      gender: "Female",
      contactPhone: "713-555-4321",
      contactEmail: "mary.whistler@gmail.com",
      contactStreetAddress: "775 West Kingsley",
      contactCity: "Fort Collins",
      contactState: "CO",
      contactZip: "80521",
      contactCountry: "USA",
      picture: "mary1.jpg",
      vacPicture: "",
      bloodType: "O",
      alergies: "Gluten",
      diseaseHistory: "Malaria at age 12",
      notes: "Spent an extensive amount of time in Africa",
      BirthBcgDate: '03/19/1997',
      BirthBcgAdministered: 'Jony Java',
      BirthBcgHospital: 'United Childrens',
      BirthBcgNext: '05/17/1997',
      sixPcvDate: '04/14/1997',
      sixPcvAdministered: 'Jimmy Smalltalk',
      sixPcvHospital: 'Saint Matthews',
      sixPcvNext: '06/12/1997'
    }, {
      id: "3",
      userName: "sherlock",
      password: "irene",
      firstName: "Sherlock",
      middleName: "",
      lastName: "Holmes",
      fatherFullName: "Mark Holmes",
      motherFullName: "Violet Holmes",
      motherMaidenName: "Moriarty",
      birthYear: "1972",
      birthMonth: "5",
      birthDay: "21",
      gender: "Male",
      contactPhone: "616-555-1221",
      contactEmail: "sherlock.holmes@gmail.com",
      contactStreetAddress: "221B Baker Street",
      contactCity: "Houston",
      contactState: "TX",
      contactZip: "77098",
      contactCountry: "England",
      picture: "sherlock1.jpg",
      vacPicture: "",
      bloodType: "O",
      alergies: "None",
      diseaseHistory: "Pneumonia at age 13",
      notes: "Patient also may be suffering from depression",
      BirthOpvDate: '05/29/1972',
      BirthOpvAdministered: 'John Pascal',
      BirthOpvHospital: 'Saint Lukes',
      BirthOpvNext: '06/12/1972'
    }];
    return patients;
  };

  this.sendEmail = function(req, res) {
    db.collection('patients', function(err, collection) {
      collection.findOne({
        _id: new BSON.ObjectID(req.params.id)
      }, function(err, item) {
        if (err) {
          res.send(JSON.stringify({
            status: 'failure'
          }));
        } else if (item) {
          SendEmailLib.sendMail(item, function(success) {
            if (success) {
              res.send(JSON.stringify({
                status: 'success'
              }));
            } else {
              res.send(JSON.stringify({
                status: 'failure'
              }));
            }
          });
        }
      });
    });
  };
};
