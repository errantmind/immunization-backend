var mandrill = require('node-mandrill')('QF_csC3bNCiYrXx3cw5XjA');
var fs = require("fs");
var path = require("path");
var fields = ["BirthBcgDate", "BirthBcgAdministered", "BirthBcgHospital", "BirthBcgNext", "BirthHepbDate", "BirthHepbAdministered", "BirthHepbHospital", "BirthHepbNext", "BirthOpvDate", "BirthOpvAdministered", "BirthOpvHospital", "BirthOpvNext", "sixPcvDate", "sixPcvAdministered", "sixPcvHospital", "sixPcvNext", "sixHepbDate", "sixHepbAdministered", "sixHepbHospital", "sixHepbNext", "sixOpvDate", "sixOpvAdministered", "sixOpvHospital", "sixOpvNext", "sixRvDate", "sixRvAdministered", "sixRvHospital", "sixRvNext", "sixDtapDate", "sixDtapAdministered", "sixDtapHospital", "sixDtapNext", "tenPcvDate", "tenPcvAdministered", "tenPcvHospital", "tenPcvNext", "tenOpvDate", "tenOpvAdministered", "tenOpvHospital", "tenOpvNext", "tenRvDate", "tenRvAdministered", "tenRvHospital", "tenRvNext", "tenDtapDate", "tenDtapAdministered", "tenDtapHospital", "tenDtapNext", "tenHibDate", "tenHibAdministered", "tenHibHospital", "tenHibNext", "fourteenPcvDate", "fourteenPcvAdministered", "fourteenPcvHospital", "fourteenPcvNext", "fourteenHepbDate", "fourteenHepbAdministered", "fourteenHepbHospital", "fourteenHepbNext", "fourteenOpvDate", "fourteenOpvAdministered", "fourteenOpvHospital", "fourteenOpvNext", "fourteenRvDate", "fourteenRvAdministered", "fourteenRvHospital", "fourteenRvNext", "fourteenDtapDate", "fourteenDtapAdministered", "fourteenDtapHospital", "fourteenDtapNext", "fourteenHibDate", "fourteenHibAdministered", "fourteenHibHospital", "fourteenHibNext", "sixTwelveInfluenzaDate", "sixTwelveInfluenzaAdministered", "sixTwelveInfluenzaHospital", "sixTwelveInfluenzaNext", "sixTwelvePcvDate", "sixTwelvePcvAdministered", "sixTwelvePcvHospital", "sixTwelvePcvNext", "sixTwelveHepbDate", "sixTwelveHepbAdministered", "sixTwelveHepbHospital", "sixTwelveHepbNext", "sixTwelveHibDate", "sixTwelveHibAdministered", "sixTwelveHibHospital", "sixTwelveHibNext", "sixTwelveHepaDate", "sixTwelveHepaAdministered", "sixTwelveHepaHospital", "sixTwelveHepaNext", "sixTwelveMmrDate", "sixTwelveMmrAdministered", "sixTwelveMmrHospital", "sixTwelveMmrNext", "sixTwelveVaricellaDate", "sixTwelveVaricellaAdministered", "sixTwelveVaricellaHospital", "sixTwelveVaricellaNext", "fifteenHibDate", "fifteenHibAdministered", "fifteenHibHospital", "fifteenHibNext", "fifteenHepaDate", "fifteenHepaAdministered", "fifteenHepaHospital", "fifteenHepaNext", "fifteenMmrDate", "fifteenMmrAdministered", "fifteenMmrHospital", "fifteenMmrNext", "fifteenDtapDate", "fifteenDtapAdministered", "fifteenDtapHospital", "fifteenDtapNext", "twoDtapDate", "twoDtapAdministered", "twoDtapHospital", "twoDtapNext", "twoVaricellaDate", "twoVaricellaAdministered", "twoVaricellaHospital", "twoVaricellaNext", "nineDtapDate", "nineDtapAdministered", "nineDtapHospital", "nineDtapNext", "nineMcvDate", "nineMcvAdministered", "nineMcvHospital", "nineMcvNext", "nineHpvDate", "nineHpvAdministered", "nineHpvHospital", "nineHpvNext"];


exports.sendMail = function(patientObject, callback) {

  var template = fs.readFileSync(path.resolve(__dirname, 'template.html')).toString("ascii");
  var html = template;
  for (var i in fields) {
    //replace {data} with field
    html = html.replace("{data}", patientObject[fields[i]]);
  }

  mandrill('/messages/send', {
    message: {
      to: [{
        email: patientObject.contactEmail,
        name: patientObject.firstName + " " + patientObject.lastName
      }],
      from_email: 'notification@immunization-api.herokuapp.com',
      subject: "Immunization info for " + patientObject.firstName + " " + patientObject.lastName,
      text: html
    }
  }, function(error, response) {
    if (error || response[0].status === 'invalid') {
      console.log(JSON.stringify(error));
      callback(false);
    } else {
      console.log(response);
      callback(true);
    }
  });
};
