// Required for side-effects
var firebase = require("firebase");
require("firebase/firestore");
var firebaseConfig = require("../src/Provider/Firebase-conf");
var Customer = require("../src/Model/Customer");
var Session = require("../src/Model/Session");
var map = require('lodash/map');
var moment = require('moment');

firebase.initializeApp(firebaseConfig);


firebase.auth().signInWithEmailAndPassword("galdamer@gmail.com", "03Enero1984")
    .then(res => {
        if(res){
            firebase.firestore().collection("sessions")
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                    firebase.firestore().collection("sessions_backup").doc(doc.data().id).set(doc.data()).then(() => {
                        console.log(doc.data().id);
                    });
                });
            });
        }
    }).catch(ex => {
        console.log("Error de usuario, compruebe su usuario y contraseña");
    });