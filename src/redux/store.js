import { configureStore } from "@reduxjs/toolkit";
import mapsReducer from "./features/mapsSlice";
import authReducer from "./features/authSlice";
import bikeOrderReducer from "./features/bikeOrderSlice";

export const store = configureStore({
  reducer: {
    maps: mapsReducer,
    auth: authReducer,
    bikeOrder: bikeOrderReducer,
    // Add other reducers here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["maps/updateLocation"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["maps.locations"],
      },
    }),
});
