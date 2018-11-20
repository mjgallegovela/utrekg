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
            firebase.firestore().collection("results")
                .orderBy("id", "asc").get()
                .then(querySnapshot => {
                    querySnapshot.forEach(doc => {

                    var data = doc.data();
                    //console.log(data.id + ": " + data.nombre + " " + data.apellido1 + " " + data.apellido2)
                    let newCustomer = new Customer();
                    for(var field in newCustomer) {
                        if(data[field] !== undefined) {
                            newCustomer[field] = data[field];
                        } else {
                            newCustomer[field] = null;
                        }
                    }
                    let firstSession = new Session();
                    for(var field in firstSession) {
                        if(data[field] !== undefined) {
                            firstSession[field] = data[field];
                        } else {
                            firstSession[field] = null;
                        }
                    }
                    let momentDate = moment(new Date(data.fecha_registro));
                    if(data.fecha_registro === null) {
                        console.log(data.id + ": Sin fecha");
                    } else {
                        console.log(data.id + ": " + data.fecha_registro);
                    }
                    firstSession.id = data.id + "_" + momentDate.format("YYYYMMDD");
                    firstSession.customer = data.id;
                    firstSession.fecha_visita = data.fecha_registro;

                    var newCustomerObject = {};
                    var firstSessionObject = {};

                    map(firstSession, (value, key) => {
                        firstSessionObject[key] = value;
                    });

                    map(newCustomer, (value, key) => {
                        newCustomerObject[key] = value;
                    });
                    
                    firebase.firestore().collection("customers").doc(data.id).set(newCustomerObject).then(() => {
                        console.log(data.id + ": " + data.nombre + " " + data.apellido1 + " " + data.apellido2);
                        firebase.firestore().collection("sessions").doc(firstSessionObject.id).set(firstSessionObject).then(() => {
                            console.log("--> First Visit --> " + firstSessionObject.id);
                        });
                    });
                });
            });
        }
    }).catch(ex => {
        console.log("Error de usuario, compruebe su usuario y contraseña");
    });
