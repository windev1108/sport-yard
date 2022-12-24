import 'firebase/compat/analytics';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import "firebase/compat/storage";
import firebase from 'firebase/compat/app';

const firebaseConfig  = {
  apiKey: "AIzaSyDWoWInZRYcZdX1IeqtoIdIsMcdMgvsyjM",
  authDomain: "sport-yard-eeab0.firebaseapp.com",
  projectId: "sport-yard-eeab0",
  storageBucket: "sport-yard-eeab0.appspot.com",
  messagingSenderId: "681289072671",
  appId: "1:681289072671:web:999602485101dc50ec552a"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// init services
const auth = firebase.auth();
const db = firebase.firestore();

export { db, auth };
export default firebase;
