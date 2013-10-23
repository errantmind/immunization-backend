"use strict";

exports.Patients = function() {
  var MongoLib,
    MongoServer,
    MongoDB,
    BSON,
    server,
    db;

  this.initDB = function() {
    MongoLib = require('mongodb');

    MongoServer = MongoLib.Server;
    MongoDB = MongoLib.Db;
    BSON = MongoLib.BSONPure;
    var mongoUri = process.env.MONGOLAB_URI ||
      process.env.MONGOHQ_URL ||
      'mongodb://localhost/mydb';

    server = new MongoServer(mongoUri, 27017, {
      auto_reconnect: true
    });

    db = new MongoDB('patientdb', server, {
      safe: true
    });

    db.open(function(err, db) {
      if (!err) {
        console.log("Connected to 'patientdb' database");
        db.collection('patients', {
          strict: true
        }, function(err, collection) {
          if (err) {
            console.log("The 'patients' collection doesn't exist. Creating it with sample data...");
            db.collection('patients', function(err, collection) {
              collection.insert(getSamplePatients(), {
                safe: true
              }, function(err, result) {});
            });
          }
        });
      }
    });
  };

  this.closeDB = function() {
    db.close();
  };

  this.login = function(req, res) {
    var post = req.body;
    //console.log(post);
    if (post && post.username && post.password) {
      //console.log("Username: " + post.username + ", Password: " + post.password);
      var user = authenticateUser(post.username, post.password);
      if (user) {
        req.session.user_id = post.username;
        res.send('{status: "success", firstName: "' + user.firstName + '"}');
      } else {
        res.send('{status: "failure"}');
      }
    } else {
      res.send('{status: "failure", errorMsg: "Problem with Post"}');
    }
  };

  this.logout = function(req, res) {
    delete req.session.user_id;
    res.send('{status: "success"}');
  };

  this.findAllPatients = function(req, res) {
    db.collection('patients', function(err, collection) {
      collection.find().toArray(function(err, items) {
        res.send(items);
      });
    });
  };

  this.findPatientById = function(req, res) {
    var id = req.params.id;
    //console.log(req);
    console.log('Retrieving Patient Record for ID: ' + id);
    db.collection('patients', function(err, collection) {
      collection.findOne({
        '_id': new BSON.ObjectID(id)
      }, function(err, item) {
        res.send(item);
      });
    });
  };

  this.addPatient = function(req, res) {
    var patient = req.body;
    console.log('Adding Patient: ' + JSON.stringify(patient));
    db.collection('patients', function(err, collection) {
      collection.insert(patient, {
        safe: true
      }, function(err, result) {
        if (err) {
          res.send({
            'error': 'An error has occurred'
          });
        } else {
          console.log('Success: ' + JSON.stringify(result[0]));
          res.send(result[0]);
        }
      });
    });
  };

  this.updatePatient = function(req, res) {
    var id = req.params.id;
    var patient = req.body;
    console.log('Updating Patient: ' + id);
    console.log(JSON.stringify(patient));
    db.collection('patients', function(err, collection) {
      collection.update({
        '_id': new BSON.ObjectID(id)
      }, patient, {
        safe: true
      }, function(err, result) {
        if (err) {
          console.log('Error updating patient: ' + err);
          res.send({
            'error': 'An error has occurred'
          });
        } else {
          console.log('' + result + ' document(s) updated');
          res.send(patient);
        }
      });
    });
  };

  this.deletePatient = function(req, res) {
    var id = req.params.id;
    console.log('Deleting Patient: ' + id);
    db.collection('patients', function(err, collection) {
      collection.remove({
        '_id': new BSON.ObjectID(id)
      }, {
        safe: true
      }, function(err, result) {
        if (err) {
          res.send({
            'error': 'An error has occurred - ' + err
          });
        } else {
          console.log('' + result + ' document(s) deleted');
          res.send(req.body);
        }
      });
    });
  };

  this.searchPatient = function(req, res) {
    var search = req.body;

    for (var key in search) {
      if (search[key] === "") {
        delete search[key];
      }
    }

    console.log('Searching For Patient: ' + JSON.stringify(search));
    db.collection('patients', function(err, collection) {
      collection.find(search).toArray(function(err, item) {

        if (err) {
          res.send('{status: "failure"}');
        } else {
          //console.log(item);
          res.send(item);
        }

      });
    });
  };


  this.checkAuth = function(req, res, next) {
    if (req.session.user_id) {
      res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      next();
    } else {
      console.log(req.session.user_id);
      res.send('You are not authorized to view this page');
    }
  };

  var authenticateUser = function(username, password) {
    //console.log('' + username + " " + password);
    for (var user in authenticatedUsers) {
      if (authenticatedUsers[user].username === username && authenticatedUsers[user].password === password)
        return authenticatedUsers[user];
    }
    return null;
  };

  var authenticatedUsers = [{
    firstName: "Betty",
    lastName: "Crocker",
    username: "test",
    password: "test"
  }];

  var getSamplePatients = function() {
    var patients = [{
      firstName: "John",
      middleName: "Arnold",
      lastName: "Smith",
      birthYear: "1992",
      birthMonth: "11",
      birthDay: "22",
      contactPhone: "12815551234",
      contactEmail: "john.smith@gmail.com",
      picture: "john1.jpg"
    }, {
      firstName: "Mary",
      middleName: "Ann",
      lastName: "Whistler",
      birthYear: "1997",
      birthMonth: "3",
      birthDay: "2",
      contactPhone: "17135554321",
      contactEmail: "mary.whistler@gmail.com",
      picture: "mary1.jpg"
    }];

    return patients;
  };
};
