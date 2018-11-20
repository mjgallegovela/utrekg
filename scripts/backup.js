// Required for side-effects
var firebase = require("firebase");
// Required for side-effects
require("firebase/functions");

var firebaseConfig = require("../src/Provider/Firebase-conf");

firebase.initializeApp(firebaseConfig);

// Initialize Cloud Functions through Firebase
var functions = firebase.functions();

firebase.auth().signInWithEmailAndPassword("galdamer@gmail.com", "03Enero1984")
    .then(res => {
        if(res){
            var createCompleteBackup = functions.httpsCallable('createCompleteBackup');
            createCompleteBackup().then(result => {
                // Read result of the Cloud Function.
                console.log("Success...");
                console.log(result);
                
            }).catch(ex => {
                console.log(ex);
            });
        }
    }).catch(ex => {
        console.log("Error de usuario, compruebe su usuario y contraseña");
        console.log(ex);
    });
