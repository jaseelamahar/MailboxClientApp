import { configureStore } from "@reduxjs/toolkit";
import inboxReducer from "./inboxSlice";

const store = configureStore({
  reducer: {
    inbox: inboxReducer
  }
});

export default store;
