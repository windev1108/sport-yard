import 'firebase/compat/analytics';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import "firebase/compat/storage";
import firebase from 'firebase/compat/app';

const firebaseConfig  = {
  apiKey: "AIzaSyB88Ar8NKRHmcMDJejIfF-uV7exwi_7eLI",
  authDomain: "sport-yard-40ac7.firebaseapp.com",
  projectId: "sport-yard-40ac7",
  storageBucket: "sport-yard-40ac7.appspot.com",
  messagingSenderId: "291278538548",
  appId: "1:291278538548:web:0be226549493cd0bba4761",
  measurementId: "G-RKH8CZ5M5P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// init services
const auth = firebase.auth();
const db = firebase.firestore();

// Firebase storage reference
const storage = firebase.storage();

export { db, auth, storage };
export default firebase;
