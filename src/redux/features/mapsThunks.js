import { createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { dbFirestore } from "../../config/firebase";
import { setError, setLoading } from "./mapsSlice";

export const fetchTerminals = createAsyncThunk(
  "maps/fetchTerminals",
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const querySnapshot = await getDocs(collection(dbFirestore, "terminal"));
      const terminalData = querySnapshot.docs.map((doc, index) => ({
        ...doc.data(),
        iteration: index + 1,
      }));
      return terminalData;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);
