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
            firebase.firestore().collection("customers").get().then(customersQuerySnapshot => {
                var collection = [];
                var nitems = 0;
                customersQuerySnapshot.forEach(docCustomer => {
                    let customer = docCustomer.data();
                    firebase.firestore().collection("sessions").where("customer", "==", customer.id)
                        .get()
                        .then(querySnapshot => {
                            querySnapshot.forEach(docSession => {

                            var data = docSession.data();
                        
                            data.t_en_I = data.t_cara_lateral; // select
                            data.t_en_II = data.t_cara_inferior; // select
                            data.t_en_III = data.t_cara_inferior; // select
                            data.t_en_AVL = data.t_cara_inferior; // select
                            data.t_en_AVF = data.t_cara_lateral; // select
                            data.t_en_AVR =  data.t_cara_lateral; // select
                            data.t_en_V1 = data.t_cara_septal; // select
                            data.t_en_V2 = data.t_cara_septal; // select
                            data.t_en_V3 = data.t_cara_anterior; // select
                            data.t_en_V4 = data.t_cara_anterior; // select
                            data.t_en_V5 = data.t_cara_lateral_alta; // select
                            data.t_en_V6 = data.t_cara_lateral_alta; // select
                            // IMC
                            let peso = parseFloat(data.peso);
                            let altura = parseFloat(data.altura);

                            if(!isNaN(altura) && altura > 0) {
                                data.IMC= (peso / (altura / 100) * (altura/100)).toFixed(2);
                                //console.log("IMC: " + data.IMC);
                            } else {
                                data.IMC = "";
                            }

                            // filtrado glomerular (FG) en AP
                            var momentBirth = moment(new Date(customer.fecha_nacimiento));
                            var edad = moment(new Date( data.fecha_visita)).diff(momentBirth, 'years');
                            var coef = 1;
                            if(customer.sexo === "M") {
                                coef = .85;
                            }
                            data.FG = (coef * peso * (140-edad)/(72* data.creatinina)).toFixed(2);

                            firebase.firestore().collection("sessions").doc(data.id).set(data).then(() => {
                                console.log(data.id);
                            });
                        });
                    });
                });
            });
        }
    }).catch(ex => {
        console.log("Error de usuario, compruebe su usuario y contraseña");
    });
