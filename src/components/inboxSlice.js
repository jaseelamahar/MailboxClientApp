import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state of the inbox
const initialState = {
  emails: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Thunk to fetch inbox emails from Firebase
export const fetchInboxEmails = createAsyncThunk(
  'inbox/fetchInboxEmails', // action type
  async () => {
    const firebaseURL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';
    const response = await fetch(`${firebaseURL}/emails.json`);
    const data = await response.json();
    
    // Process and return the emails
    const emailsArray = Object.keys(data).flatMap((userKey) => {
      if (!data[userKey]?.inbox) return [];
      const formattedUserKey = userKey.replace(/[@]/g, ',');
      return Object.keys(data[userKey].inbox).map((emailId) => {
        const emailData = data[userKey].inbox[emailId];
        return { id: emailId, userId: formattedUserKey, ...emailData };
      });
    });

    return emailsArray.filter((email) => email.id); // Only return emails with id
  }
);

// Thunk to delete email from Firebase
export const deleteEmail = createAsyncThunk(
  'inbox/deleteEmail',
  async (email, { rejectWithValue }) => {
    const firebaseURL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';
    const formattedUserId = email.userId.replace(',', '@');
    
    try {
      // Delete inbox email
      await fetch(`${firebaseURL}/emails/${formattedUserId}/inbox/${email.id}.json`, {
        method: 'DELETE',
      });
      
      // Delete sent email
      await fetch(`${firebaseURL}/emails/${formattedUserId}/sent/${email.id}.json`, {
        method: 'DELETE',
      });

      return email.id; // Return email id for Redux update
    } catch (error) {
      return rejectWithValue(error.message); // Return error message in case of failure
    }
  }
);

// Create the slice to handle the actions
const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    setEmails: (state, action) => {
      state.emails = action.payload;
      state.unreadCount = state.emails.filter((email) => !email.read).length;
    },
    markAsRead: (state, action) => {
      const emailIndex = state.emails.findIndex((email) => email.id === action.payload);
      if (emailIndex !== -1) {
        state.emails[emailIndex].read = true;
        state.unreadCount = state.emails.filter((email) => !email.read).length;
      }
    },
    addDeleteEmail: (state, action) => {
      state.emails = state.emails.filter((email) => email.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInboxEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInboxEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload;
        state.unreadCount = action.payload.filter((email) => !email.read).length;
      })
      .addCase(fetchInboxEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = state.emails.filter((email) => email.id !== action.payload);
      })
      .addCase(deleteEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setEmails, markAsRead, addDeleteEmail } = inboxSlice.actions;

export default inboxSlice.reducer;
