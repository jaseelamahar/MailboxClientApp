import { createSlice } from "@reduxjs/toolkit";

const inboxSlice = createSlice({
  name: "inbox",
  initialState: {
    emails: [], // Stores all emails in inbox
    sentEmails: [], // Store sent emails
    unreadCount: 0, // Track unread emails
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setEmails: (state, action) => {
      state.emails = action.payload;
      state.unreadCount = action.payload.filter(email => !email.read).length || 0;
    },
    addSentEmail: (state, action) => {
      state.sentEmails.push(action.payload);
      state.emails.push(action.payload); 
    },
    markAsRead: (state, action) => {
      const email = state.emails.find(email => email.id === action.payload);
      if (email && !email.read) {
        email.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    addDeleteEmail: (state, action) => {
      state.emails = state.emails.filter(email => email.id !== action.payload);
      state.unreadCount = state.emails.filter(email => !email.read).length || 0;
    }
  }
});

export const { setEmails, addSentEmail, markAsRead, addDeleteEmail, setUserId } = inboxSlice.actions;
export default inboxSlice.reducer;
