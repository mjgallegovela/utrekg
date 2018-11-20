// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
var db = admin.firestore();
var bucket = admin.storage().bucket("utrekg-2018.appspot.com");

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref.toString());
  });
});

exports.createCompleteBackup = functions.https.onRequest((req, res) => {


//functions.https.onRequest((req, res) => {
  let now = new Date();
  /*
  db.collection('results').get().then(querySnapshot => {
    let list = [];
    querySnapshot.forEach(doc => { 
      list.push(doc);
    });

    const file = myBucket.file('backups/' + now.getFullYear() + now.getMonth() + now.getDay() + "/all.json");
    const contents = JSON.stringify(list);

    //-
    // If the callback is omitted, we'll return a Promise.
    //-
    file.save(contents).then(function() {
      return { result: 0 };
    }).catch(ex => {
      console.log("Error saving file:", ex);
    });
    return { result: 0 };
  }).catch(ex => {
    console.log("Error getting documents:", ex);
  });
  */
  res.send("Hello");
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
      // Grab the current value of what was written to the Realtime Database.
      const original = snapshot.val();
      console.log('Uppercasing', context.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return snapshot.ref.parent.child('uppercase').set(uppercase);
    });


exports.newResultsBackup = functions.firestore
  .document('results/{resultId}').onCreate((snap, context) => {
    return backupResults(snap, context, 'create');
  });

exports.resultsBackup = functions.firestore
  .document('results/{resultId}').onUpdate((snap, context) => {
    return backupResults(snap, context, 'update');
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