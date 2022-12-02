import 'firebase/compat/analytics';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import "firebase/compat/storage";
import firebase from 'firebase/compat/app';

const firebaseConfig  = {
  apiKey: "AIzaSyD8_RCodBhFDRh_XfooDZ54lkxWqtNyrhk",
  authDomain: "sport-yard-a8dea.firebaseapp.com",
  projectId: "sport-yard-a8dea",
  storageBucket: "sport-yard-a8dea.appspot.com",
  messagingSenderId: "191233030903",
  appId: "1:191233030903:web:cd4a99351665ae80cb71f2",
  measurementId: "G-C1Q6W4FEQP"
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
