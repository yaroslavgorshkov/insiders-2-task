import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBbE4m2xcu_ioMwa-2DGejYfvYmCjCH6X8',
    authDomain: 'insiders-2-task.firebaseapp.com',
    projectId: 'insiders-2-task',
    storageBucket: 'insiders-2-task.firebasestorage.app',
    messagingSenderId: '976411527542',
    appId: '1:976411527542:web:1b4aa675c9e73cdd18d257',
    measurementId: 'G-975T19R95L',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
