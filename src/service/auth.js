// import { auth, googleProvider } from "../config/firebase";
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signInWithPopup,
//   signOut,
// } from "firebase/auth";

// export const signIn = async ({email, password}) => {
//   try {
//     // const login = JWTEncrypt( email, password);
//     // return login
//     const login = await signInWithEmailAndPassword(auth, email, password)
//     console.log(login)
//   } catch (err) {
//     console.error(err);
//   }
// };

// export const signInWithGoogle = async () => {
//   try {
//     await signInWithPopup(auth, googleProvider);
//   } catch (err) {
//     console.error(err);
//   }
// };

// export const logout = async () => {
//   try {
//     await signOut(auth);
//   } catch (err) {
//     console.error(err);
//   }
// };
