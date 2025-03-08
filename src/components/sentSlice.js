import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const firebaseURL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';

// Initial state for sent emails
const initialState = {
  emails: [],
  loading: false,
  error: null,
};

// Fetch Sent Emails from Firebase
export const fetchSentEmails = createAsyncThunk(
  'sent/fetchSentEmails',
  async () => {
    const response = await fetch(`${firebaseURL}/emails.json`);
    const data = await response.json();
    //console.log("Fetched Sent Emails Data:", data);

    // Process and return the sent emails
    const emailsArray = Object.keys(data).flatMap((userKey) => {
      if (!data[userKey]?.sent) return [];
      const formattedUserKey = userKey.replace(/[@]/g, ',');
      return Object.keys(data[userKey].sent).map((firebaseKey) => {
        const emailData = data[userKey].sent[firebaseKey];
        return { firebaseKey, userId: formattedUserKey, ...emailData };
      });
    });

    return emailsArray.filter((email) => email.firebaseKey); // Only return emails with a Firebase key
  }
);


// Delete Sent Email from Firebase
export const deleteSentEmail = createAsyncThunk(
  'sent/deleteSentEmail',
  async ({ userId, firebaseKey }, { rejectWithValue }) => {
    console.log("Received for deletion -> userId:", userId, "firebaseKey:", firebaseKey);
    const formattedUserId = userId.replace(',', '@');
    //console.log("Deleting :", formattedUserId, "and firebaseKey:", firebaseKey);

    try {
      const response = await fetch(`${firebaseURL}/emails/${formattedUserId}/sent/${firebaseKey}.json`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting email: ${response.statusText}`);
      }

      //console.log("Successfully deleted email with key:", firebaseKey);
      return firebaseKey;
    } catch (error) {
      console.error("Error deleting email:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Mark Sent Email as Read
export const marksentAsRead = createAsyncThunk(
  'sent/marksentAsRead',
  async ({ userId, firebaseKey }, { rejectWithValue }) => {
    console.log("Marking as read -> userId:", userId, "firebaseKey:", firebaseKey);
    const formattedUserId = userId.replace(',', '@');

    try {
      await fetch(`${firebaseURL}/emails/${formattedUserId}/sent/${firebaseKey}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
        headers: { 'Content-Type': 'application/json' }
      });
      return { firebaseKey, type: "sent" };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sentSlice = createSlice({
  name: 'sent',
  initialState,
  reducers: {
    addSentEmail: (state, action) => {
      state.emails.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSentEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSentEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload.filter(
          (email, index, self) => 
            index === self.findIndex((e) => e.firebaseKey === email.firebaseKey)
        );
      })
      .addCase(fetchSentEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteSentEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSentEmail.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Deleted email with key:", action.payload);
        state.emails = state.emails.filter((email) => email.firebaseKey !== action.payload);
      })
      .addCase(deleteSentEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(marksentAsRead.fulfilled, (state, action) => {
        const email = state.emails.find((e) => e.firebaseKey === action.payload.firebaseKey);
        if (email) email.read = true;
      });
  },
});

export const {addSentEmail } = sentSlice.actions;
export default sentSlice.reducer;
