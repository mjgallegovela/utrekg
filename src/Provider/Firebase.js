import firebase from 'firebase';
import Config from './Firebase-conf';

// Required for side-effects
require("firebase/firestore");

firebase.initializeApp(Config);

/*
export const fbAuth = firebase.auth();
export const fbFirestore = firebase.firestore();
*/
export default firebase;