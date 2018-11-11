// Required for side-effects
var firebase = require("firebase");
require("firebase/firestore");
var firebaseConfig = require("../src/Provider/Firebase-conf");

firebase.initializeApp(firebaseConfig);


firebase.auth().signInWithEmailAndPassword("galdamer@gmail.com", "03Enero1984")
      .then(res => {
        if(res){
          //res.getToken().then(token => console.log(token));
          
          firebase.firestore().collection("results")
            .orderBy("id", "desc").get()
            .then(querySnapshot => {
                
                var collection = [];
                querySnapshot.forEach(doc => {
                    //console.log(doc.data());
                    var data = doc.data();
                    console.log(data.id + ": " + data.nombre + " " + data.apellido1 + " " + data.apellido2)
                    //collection.push(doc.data());
                });
                
               
            });
           
        }
      })
      .catch(ex => {
        console.log("Error de usuario, compruebe su usuario y contraseña");
      });
