import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  emails: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Thunk to fetch inbox emails from Firebase
export const fetchInboxEmails = createAsyncThunk(
  'inbox/fetchInboxEmails',
  async () => {
    const firebaseURL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';
    const response = await fetch(`${firebaseURL}/emails.json`);
    const data = await response.json();

    const emailsArray = Object.keys(data).flatMap((userKey) => {
      if (!data[userKey]?.inbox) return [];
      const formattedUserKey = userKey.replace(/[@]/g, ',');
      return Object.keys(data[userKey].inbox).map((firebaseKey) => {
        const emailData = data[userKey].inbox[firebaseKey];
        return { firebaseKey, userId: formattedUserKey, ...emailData };
      });
    });

    return emailsArray.filter((email) => email.firebaseKey);
  }
);

// Thunk to mark email as read (updates Firebase)
export const markAsRead = createAsyncThunk(
  "inbox/markAsRead",
  async (firebaseKey, { getState }) => {
    const state = getState();
    const email = state.inbox.emails.find((email) => email.firebaseKey === firebaseKey);
    if (!email) return;

    const formattedUserId = email.userId.replace(",", "@");
    const firebaseURL = "https://mailboxclient-7f072-default-rtdb.firebaseio.com";

    await fetch(`${firebaseURL}/emails/${formattedUserId}/inbox/${firebaseKey}.json`, {
      method: "PATCH",
      body: JSON.stringify({ read: true }),
      headers: { "Content-Type": "application/json" },
    });

    return firebaseKey;
  }
);

// Thunk to delete email
export const deleteEmail = createAsyncThunk(
  'inbox/deleteEmail',
  async (email, { rejectWithValue }) => {
    const firebaseURL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';
    const formattedUserId = email.userId.replace(',', '@');

    try {
      await fetch(`${firebaseURL}/emails/${formattedUserId}/inbox/${email.firebaseKey}.json`, {
        method: 'DELETE',
      });

      await fetch(`${firebaseURL}/emails/${formattedUserId}/sent/${email.firebaseKey}.json`, {
        method: 'DELETE',
      });

      return email.firebaseKey;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Inbox slice
const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {},
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
      .addCase(markAsRead.fulfilled, (state, action) => {
        const email = state.emails.find((mail) => mail.firebaseKey === action.payload);
        if (email) {
          email.read = true;
          state.unreadCount = state.emails.filter((email) => !email.read).length;
        }
      })
      .addCase(deleteEmail.fulfilled, (state, action) => {
        state.emails = state.emails.filter((email) => email.firebaseKey !== action.payload);
        state.unreadCount = state.emails.filter((email) => !email.read).length;
      });
  },
});

export default inboxSlice.reducer;
