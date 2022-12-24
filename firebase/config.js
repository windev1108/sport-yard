import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';

const firebaseConfig  = {
  apiKey: "AIzaSyD_JkSisqhjxFylEXXjns0W2Xjp365gWJk",
  authDomain: "sport-yard-a5e03.firebaseapp.com",
  projectId: "sport-yard-a5e03",
  storageBucket: "sport-yard-a5e03.appspot.com",
  messagingSenderId: "898374330184",
  appId: "1:898374330184:web:a12c58861948b16786357d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// init services
const db = firebase.firestore();

export { db };
export default firebase;
