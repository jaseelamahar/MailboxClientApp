import { createSlice } from "@reduxjs/toolkit";

const inboxSlice = createSlice({
  name: "inbox",
  initialState: {
    emails: [], // Stores all emails (inbox)
    sentEmails: [], // Stores sent emails
    unreadCount: 0, // Tracks unread emails
  },
  reducers: {
    setEmails: (state, action) => {
      state.emails = action.payload;
      state.unreadCount = action.payload.filter(email => !email.read).length||0;
    },
    addSentEmail: (state, action) => {
      state.sentEmails.push(action.payload);
      state.emails.push(action.payload); // Optional: Add sent mail to inbox view
    },
    markAsRead: (state, action) => {
      const emailIndex = state.emails.findIndex(email => email.id === action.payload);
      if (emailIndex !== -1 && !state.emails[emailIndex].read) {
        state.emails[emailIndex].read = true;
        if (state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
      }
    }
  }
});

export const { setEmails, addSentEmail, markAsRead } = inboxSlice.actions;
export default inboxSlice.reducer;
