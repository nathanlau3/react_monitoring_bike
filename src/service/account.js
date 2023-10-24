// import { auth, db } from "../config/firebase";
// import {
//     getDocs,
//     getDoc,
//     collection,
//     addDoc,
//     deleteDoc,
//     updateDoc,
//     doc,
//     limit,
//   } from "firebase/firestore";
//   import { query, where , and} from "firebase/firestore";

// const accountCollectionRef = collection(db, "accounts");

// export const getAccountLogin = async (niu, password) => {
//     try {
//       const q = query(accountCollectionRef, limit(1), and(where("NIU", "==", niu), where("password", "==", password)));
//       const data = await getDocs(q)
//       const filteredData = data.docs.map((doc) => ({
//         ...doc.data(),
//         id: doc.id,
//       }));
//       console.log(filteredData[0])
//       return filteredData[0]
//     } catch (err) {
//       console.error(err);
//     }
//   };

  


