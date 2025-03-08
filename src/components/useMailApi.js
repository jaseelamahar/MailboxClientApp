import { useState, useEffect,useCallback } from 'react';

const FIREBASE_URL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';

const useMailApi = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch Inbox Emails
  const fetchInboxEmails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${FIREBASE_URL}/emails.json`); 
      const data = await response.json();
  
      if (!data) {
        setEmails([]);
        setUnreadCount(0);
        return;
      }
  
      const emailsArray = Object.keys(data).flatMap((userKey) => {
        if (!data[userKey]?.inbox) return [];
        return Object.keys(data[userKey].inbox).map((firebaseKey) => ({
          firebaseKey,
          userId: userKey.replace(',', '@'),
          ...data[userKey].inbox[firebaseKey],
          read: !!data[userKey].inbox[firebaseKey].read,
        }));
      });
  
      const filteredEmails = emailsArray.filter(
        (email) => email.subject?.trim() && email.body?.trim()
      );
  
      setEmails(filteredEmails);
      setUnreadCount(filteredEmails.filter((email) => !email.read).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); 
  
  // Mark Email as Read
  const markAsRead = async (email) => {
    try {
      const response = await fetch(
        `${FIREBASE_URL}/emails/${email.userId}/inbox/${email.firebaseKey}.json`,
        {
          method: "PATCH",
          body: JSON.stringify({ read: true }),
          headers: { "Content-Type": "application/json" },
        }
      );
  
      const data = await response.json();
      console.log("API Response:", data); 
  
      if (!response.ok) {
        throw new Error(`Failed to update read status: ${response.status}`);
      }
  
      
      setEmails((prevEmails) =>
        prevEmails.map((mail) =>
          mail.firebaseKey === email.firebaseKey ? { ...mail, read: true } : mail
        )
      );
  
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
  
    } catch (err) {
      console.error("Error marking email as read:", err);
    }
  };
  
// Wrap fetchSentEmails in useCallback
const fetchSentEmails = useCallback(async (formattedEmail) => {
  setLoading(true);
  try {
    const response = await fetch(`${FIREBASE_URL}/emails/${formattedEmail}/sent.json`);
    const data = await response.json();

    if (!data) return;

    const sentEmailsArray = Object.entries(data).map(([key, value]) => ({
      firebaseKey: key,
      ...value,
      sent: true, // 
    }));

    
    setEmails((prevEmails) => [...prevEmails, ...sentEmailsArray]);

  } catch (error) {
    console.error("Error fetching sent emails:", error);
  } finally {
    setLoading(false);
  }
}, []);


  
   // Delete Email
  const deleteEmail = async (email) => {
    const formattedUserId = email.userId.replace(',', '@');

    try {
      await fetch(`${FIREBASE_URL}/emails/${formattedUserId}/inbox/${email.firebaseKey}.json`, { // ✅ Fixed backticks
        method: "DELETE",
      });

      await fetch(`${FIREBASE_URL}/emails/${formattedUserId}/sent/${email.firebaseKey}.json`, { // ✅ Fixed backticks
        method: "DELETE",
      });

      setEmails((prevEmails) => {
        const updatedEmails = prevEmails.filter((mail) => mail.firebaseKey !== email.firebaseKey);
        return updatedEmails // Ensures UI updates properly
      });
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };
  
  
  
  useEffect(() => {
    fetchInboxEmails();
  }, []);

  return { emails, unreadCount, setUnreadCount, loading, error, fetchInboxEmails, markAsRead, deleteEmail, fetchSentEmails };
};

export default useMailApi;
