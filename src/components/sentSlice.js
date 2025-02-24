import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch Sent Emails from Firebase
export const fetchSentEmails = createAsyncThunk(
    'sent/fetchSentEmails', // action type
    async () => {
      const firebaseURL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';
      const response = await fetch(`${firebaseURL}/emails.json`);
      const data = await response.json();
      
      // Process and return the sent emails
      const emailsArray = Object.keys(data).flatMap((userKey) => {
        if (!data[userKey]?.sent) return [];
        const formattedUserKey = userKey.replace(/[@]/g, ',');
        return Object.keys(data[userKey].sent).map((emailId) => {
          const emailData = data[userKey].sent[emailId];
          return { id: emailId, userId: formattedUserKey, ...emailData };
        });
      });
  
      return emailsArray.filter((email) => email.id); // Only return emails with id
    }
  );
  

// Delete Sent Email from Firebase
export const deleteSentEmail = createAsyncThunk(
  'sent/deleteSentEmail',
  async ({ userId, emailId }) => {
    const formattedUserId = userId.replace(',', '@'); // Format userId for Firebase
    await fetch(`https://mailboxclient-7f072-default-rtdb.firebaseio.com/emails/${formattedUserId}/sent/${emailId}.json`, {
      method: 'DELETE',
    });
    return emailId; // Return the email ID to be removed from the state
  }
);

const sentSlice = createSlice({
  name: 'sent',
  initialState: {
    emails: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSentEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSentEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload;
      })
      .addCase(fetchSentEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteSentEmail.fulfilled, (state, action) => {
        state.emails = state.emails.filter((email) => email.id !== action.payload); // Remove deleted email from state
      });
  },
});

export default sentSlice.reducer;
