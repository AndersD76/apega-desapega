import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCXReDgeu7ORLCz84LQv_c52sLFZVAUls",
  authDomain: "apega-app.firebaseapp.com",
  projectId: "apega-app",
  storageBucket: "apega-app.firebasestorage.app",
  messagingSenderId: "693684026669",
  appId: "1:693684026669:web:f832dde25ae2a38e8c27a4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
