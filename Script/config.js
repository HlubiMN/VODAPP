import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/storage'
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDqcqTJ6ho3KqoV3pGG1PHFfKLEdG0OTN8",
    authDomain: "vodappv1.firebaseapp.com",
    databaseURL: "https://vodappv1-default-rtdb.firebaseio.com",
    projectId: "vodappv1",
    storageBucket: "vodappv1.appspot.com",
    messagingSenderId: "856612117366",
    appId: "1:856612117366:web:dc3346de1dea65371ab857",
    measurementId: "G-D7JC8BB2P4"
};

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

const database = getDatabase();
const storage = getStorage();
export { database, firebase, storage };