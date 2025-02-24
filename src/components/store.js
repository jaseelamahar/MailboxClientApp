import { configureStore } from "@reduxjs/toolkit";
import inboxReducer from "./inboxSlice";
import sentReducer from "./sentSlice"

const store = configureStore({
  reducer: {
    inbox: inboxReducer,
    sent:sentReducer
  }
});

export default store;
