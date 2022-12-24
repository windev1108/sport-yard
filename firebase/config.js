import 'firebase/compat/analytics';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import "firebase/compat/storage";
import firebase from 'firebase/compat/app';

const firebaseConfig  = {
  apiKey: "AIzaSyCfJLM1OO9iMRqL72_uYaFzj0dRTppO1d4",
  authDomain: "sport-yard-6b984.firebaseapp.com",
  projectId: "sport-yard-6b984",
  storageBucket: "sport-yard-6b984.appspot.com",
  messagingSenderId: "549178058188",
  appId: "1:549178058188:web:7c1a515d2b60b58c4f6969",
  measurementId: "G-3DK14CFH3K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// init services
const auth = firebase.auth();
const db = firebase.firestore();

export { db, auth };
export default firebase;
