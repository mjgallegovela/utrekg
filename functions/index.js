// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();
var bucket = admin.storage().bucket("utrekg-2018.appspot.com");

exports.createCompleteBackup = functions.https.onRequest((req, res) => {
  let now = new Date();
  res.send("Hello");
});

exports.newResultsBackup = functions.firestore
  .document('results/{resultId}').onCreate((snap, context) => {
    return backupResults(snap, context, 'create');
  });

exports.resultsBackup = functions.firestore
  .document('results/{resultId}').onUpdate((snap, context) => {
    return backupResults(snap, context, 'update');
  });

exports.deleteSessionsFromCustomer = functions.firestore
  .document('customers/{customerId}').onDelete((snap, context) => {
    db.collection("sessions").where("customer", "==", snap.params.customerId).orderBy("fecha_visita").get().then( querySnapshot => {
      var idList = [];
      querySnapshot.forEach(doc => {
        idList.push(doc.data().id);
      });
      idList.forEach(id => { db.collection("sessions").doc(id).delete() });
      return 0;
    }).catch((error) => {
      return 0;
    })
    return 0;
  });

exports.removeEkgIfEmpty = functions.firestore
  .document('sessions/{sessionId}').onUpdate((snap, context) => {
    if(snap.data.get("ekg_img") === "") {
      console.log("Removing: ekgs/" + snap.data.get("id") + '.jpg');
      const ekgImg = bucket.file('ekgs/' + snap.data.get("id") + '.jpg')
      ekgImg.delete().then(function() {
        console.log('ekgs/' + snap.data.get("id") + '.jpg has been removed OK');
        return 0;
      }).catch(function(error) {
        console.log("Error Removing: ekgs/" + snap.data.get("id") + '.jpg');
        return 0;
      });
    }
    return 0;
  });

exports.removeEkgSessionRemoved = functions.firestore
  .document('sessions/{sessionId}').onDelete((snap, context) => {
    console.log("Removing: ekgs/" + snap.params.sessionId + '.jpg');
    const ekgImg = bucket.file('ekgs/' + snap.params.sessionId + '.jpg')
    ekgImg.delete().then(function() {
      console.log('ekgs/' + snap.params.sessionId + '.jpg has been removed OK');
      return 0;
    }).catch(function(error) {
      console.log("Error Removing: ekgs/" + snap.params.sessionId + '.jpg');
      return 0;
    });
    return 0;
  });




function backupResults (snap, context, eventName) {
  var date = new Date();
  var n_records = 0;
  /*
  db.collection('results').get().then(querySnapshot => {
    querySnapshot.forEach(doc => { n_records++; });
    db.collection('backup').add({
      date: date,
      n_records: n_records,
      event: eventName
    });
    return 0;
  }).catch((error) => {
    console.log("Error getting document:", error);
  })
  */
  return 0;
}