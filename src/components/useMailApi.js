import { useState, useEffect } from 'react';

const FIREBASE_URL = 'https://mailboxclient-7f072-default-rtdb.firebaseio.com';

const useMailApi = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // setUnreadCount 


  // Fetch Inbox Emails
  const fetchInboxEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${FIREBASE_URL}/emails.json`);
      const data = await response.json();
      if (!data) {
        setEmails([]); // Ensure emails is always an array
        setUnreadCount(0);
        return;
      }
  

      const emailsArray = Object.keys(data).flatMap((userKey) => {
        if (!data[userKey]?.inbox) return [];
        const formattedUserKey = userKey.replace(/[@]/g, ',');
        return Object.keys(data[userKey].inbox||{}).map((firebaseKey) => ({
          firebaseKey,
          userId: formattedUserKey,
          ...data[userKey].inbox[firebaseKey],
        }));
      }).filter((email) => email.firebaseKey);
      const uniqueEmails = Object.values(
        emailsArray.reduce((acc, email) => {
          acc[email.firebaseKey] = email;
          return acc;
        }, {})
      );
  
      setEmails(uniqueEmails);

      setEmails(emailsArray);
      setUnreadCount(emailsArray.filter((email) => !email.read).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark Email as Read
  const markAsRead = async (email) => {
    try {
      await fetch(`${FIREBASE_URL}/emails/${email.userId}/inbox/${email.firebaseKey}.json`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
        headers: { "Content-Type": "application/json" },
      });
  
      setEmails((prevEmails) => {
        const updatedEmails = prevEmails.map((mail) =>
          mail.firebaseKey === email.firebaseKey ? { ...mail, read: true } : mail
        );
  
        // Update unread count immediately after updating emails
        setUnreadCount(updatedEmails.filter((mail) => !mail.read).length);
  
        return updatedEmails;
      });
  
    } catch (err) {
      console.error("Error marking email as read:", err);
    }
  };
  

  // Delete Email
  const deleteEmail = async (email) => {
    const formattedUserId = email.userId.replace(',', '@');

    await fetch(`${FIREBASE_URL}/emails/${formattedUserId}/inbox/${email.firebaseKey}.json`, {
      method: "DELETE",
    });

    await fetch(`${FIREBASE_URL}/emails/${formattedUserId}/sent/${email.firebaseKey}.json`, {
      method: "DELETE",
    });

    setEmails((prevEmails) =>
      prevEmails.filter((mail) => mail.firebaseKey !== email.firebaseKey)
    );
  };

  useEffect(() => {
    fetchInboxEmails(); // Auto-fetch emails on mount
  }, []);

  return { emails,unreadCount,setUnreadCount, loading, error, fetchInboxEmails, markAsRead, deleteEmail };
};

export default useMailApi;
