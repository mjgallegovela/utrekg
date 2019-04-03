// Required for side-effects
var firebase = require("firebase");
require("firebase/firestore");
var firebaseConfig = require("../src/Provider/Firebase-conf");
var Customer = require("../src/Model/Customer");
var Session = require("../src/Model/Session");
var dictionary = require("../src/Provider/Dictionary");
var map = require('lodash/map');
var moment = require('moment');

firebase.initializeApp(firebaseConfig);

let de = 'ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç',
    a = 'AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc',
    re = new RegExp('['+de+']' , 'ug');

firebase.auth().signInWithEmailAndPassword("galdamer@gmail.com", "03Enero1984")
    .then(res => {
        if(res){
            var mapa = {
                cual_IECA: 'tipo_predef_IECA',
                cual_ARA_II: 'tipo_predef_ARA_II',
                cual_DIU_TIAZ: 'tipo_predef_DIU_TIAZ',
                cual_diu_asa: 'tipo_predef_diu_asa',
                cual_diu_aho_k: 'tipo_predef_aho_k',
                cual_ACA_DHP: 'tipo_predef_ACA_DHP',
                tipo_acos: 'tipo_predef_acos',
                tipo_estatinas: 'tipo_predef_estatinas',
            }
            var malformedNames = {
                HIDROCLORTIAZIDA: 'Hidroclorotiazida',
                Hidroclotiazida: 'Hidroclorotiazida',
                LECARNIDIPINO: 'Lercanidipino'
            }

            firebase.firestore().collection("sessions")
                .get()
                .then(querySnapshot => {
                    querySnapshot.forEach(docSession => {

                        var data = docSession.data();
                    
                        for(var key in mapa){
                            valor = data[key];
                            if(valor !== null && valor !== undefined && valor !== "") {
                                if(malformedNames[valor] !== undefined) {
                                    valor = malformedNames[valor];
                                }
                                // mapa[key].indexOf(valor.trim().toLowerCase()) < 0) {
                                valor = valor.trim().toLowerCase().replace( re,  match => a.charAt(de.indexOf(match)) );
                                let newFieldName = mapa[key];
                                var found = false;
                                for(var index in dictionary[newFieldName]) {
                                    let predefName = dictionary[newFieldName][index];
                                    predefName = predefName.trim().toLowerCase().replace( re,  match => a.charAt(de.indexOf(match)) );
                                    if(predefName === valor) {
                                        /*
                                        console.log("Al medicamento " + data[key] + " le corresponde el valor " + 
                                            index + " de " + newFieldName + " (" + dictionary[newFieldName][index] + ")");
                                            */
                                        data[newFieldName] = index;
                                        found = true;    
                                        break;
                                    }
                                }
                                if(!found) {
                                    console.log("No existe alternativa para el medicamento " + data[key] + ", en el grupo de " + newFieldName );
                                }
                            }
                        }
                        /*
                        firebase.firestore().collection("sessions").doc(data.id).set(data).then(() => {
                            console.log(data.id);
                        });
                        */
                    });
            });
        }
    }).catch(ex => {
        console.log(ex);
        console.log("Error de usuario, compruebe su usuario y contraseña");
    });
