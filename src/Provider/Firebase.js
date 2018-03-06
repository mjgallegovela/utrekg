import firebase from 'firebase';

// Required for side-effects
require("firebase/firestore");

import {config} from './Firebase-conf';

firebase.initializeApp(config);

export const fbAuth = firebase.auth();
export const fbFirestore = firebase.firestore();