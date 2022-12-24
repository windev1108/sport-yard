import 'firebase/compat/analytics';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import "firebase/compat/storage";
import firebase from 'firebase/compat/app';

const firebaseConfig  = {
  apiKey: "AIzaSyB63wvNk_yaZZjSJ9L0RrHFyATtfSAOcpA",
  authDomain: "sport-yard-858ca.firebaseapp.com",
  projectId: "sport-yard-858ca",
  storageBucket: "sport-yard-858ca.appspot.com",
  messagingSenderId: "780042672485",
  appId: "1:780042672485:web:e394a6fe86c9bbf97e698c",
  measurementId: "G-7FWNWZLHWC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// init services
const auth = firebase.auth();
const db = firebase.firestore();

export { db, auth };
export default firebase;
