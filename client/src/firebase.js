
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNGU8ofYn6cskvb6mIS3OvSqyN8z0GWVk",
  authDomain: "planning-with-ai-f43f3.firebaseapp.com",
  projectId: "planning-with-ai-f43f3",
  storageBucket: "planning-with-ai-f43f3.firebasestorage.app",
  messagingSenderId: "77007113620",
  appId: "1:77007113620:web:3dc30ca495ec5247701381"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;