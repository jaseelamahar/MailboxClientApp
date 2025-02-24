import React, { useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEmails, markAsRead, addDeleteEmail } from "./inboxSlice";
import { Navbar, Container, Row, Col, Button, ListGroup } from "react-bootstrap";
import { useHistory } from "react-router-dom";

const firebaseURL = "https://mailboxclient-7f072-default-rtdb.firebaseio.com";

const InboxPage = () => {
  const dispatch = useDispatch();
  const emails = useSelector((state) => state.inbox.emails);
  const unreadCount = useSelector((state) => state.inbox.unreadCount);
  const userId = useSelector((state) => state.auth?.userId)?.replace(/[@.]/g, "");
  const history = useHistory();

  useEffect(() => {
    fetchInboxEmails();
  }, []);

  const fetchInboxEmails = async () => {
    try {
      const response = await fetch(`${firebaseURL}/emails.json`);
      const data = await response.json();
      console.log("📥 Fetched Firebase Data:", data);

      if (data) {
        const emailsArray = Object.keys(data).flatMap((userKey) => {
          if (!data[userKey]?.inbox) return [];
          const formattedUserKey = userKey.replace(/[@]/g, ",");

          return Object.keys(data[userKey].inbox).map((emailId) => {
            const emailData = data[userKey].inbox[emailId];
            return { id: emailId, userId: formattedUserKey, ...emailData };
          });
        });

        console.log("📌 Processed Emails for Redux:", emailsArray);
        dispatch(setEmails(emailsArray.filter(email => email.id)));
        console.log("🔥 Inbox Emails from Firebase:", Object.keys(data));

      }
    } catch (error) {
      console.error("⚠️ Error fetching emails:", error);
    }
  };
  const handleEmailClick = async (email) => {
    if (!email || !email.id || !email.userId) return;
    console.log("📧 Email Clicked:", email.id);

    const formattedUserId = email.userId.replace(/[@]./g, ",");

    if (!email.read) {
      try {
        await fetch(`${firebaseURL}/emails/${formattedUserId}/inbox/${email.id}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        });

        console.log(`✅ Email ${email.id} marked as read in Firebase`);
        dispatch(markAsRead(email.id));
        setTimeout(fetchInboxEmails, 1000);
      } catch (error) {
        console.error("❌ Error marking email as read:", error);
      }
    }

    history.push(`mail/${email.id}`);
  };

  const handleDeleteEmail = async (email) => {
    if (!email || !email.userId) return;
  
    // 🔍 Debugging userId before making request
    const formattedUserId = email.userId.replace(",", "@");
    console.log( formattedUserId);
;

    console.log("🗑️ Deleting Email for:", formattedUserId, "Email ID:", email.id);
  
    // 🛑 Add this check to confirm the user exists in Firebase
    const usersResponse = await fetch(`${firebaseURL}/emails.json`);
    const usersData = await usersResponse.json();
    console.log("🔥 Available Users in Firebase:", Object.keys(usersData));
  
    if (!usersData[formattedUserId]) {
      console.error(`❌ User ${formattedUserId} not found in Firebase.`);
      return;
    }
  
    // Fetch inbox emails for the correct user
    const response = await fetch(`${firebaseURL}/emails/${formattedUserId}/inbox.json`);
    const data = await response.json();
  
    if (!data) {
      console.error("⚠️ No emails found in Firebase for user:", formattedUserId);
      return;
    }
  
    // Find correct Firebase key for email
    const firebaseKey =  email.id;
    console.log(firebaseKey)
  
    if (!firebaseKey) {
      console.error("❌ No matching Firebase key found for email ID:", email.id);
      return;
    }
  
   try{// Delete the email
    const inboxUrl = `${firebaseURL}/emails/${formattedUserId}/inbox/${email.id}.json`;

    const inboxResponse = await fetch(inboxUrl, { method: "DELETE" });
console.log("🔥 Inbox Delete Status:", inboxResponse.status); // Log status code
const inboxResult = await inboxResponse.json(); // Check if JSON is returned
console.log("🔥 Inbox Delete Response:", inboxResult); // Log full response
 
  

    // 🗑️ Delete from Sent Mail
    const sentUrl = `${firebaseURL}/emails/${formattedUserId}/sent/${email.id}.json`;
    const sentResponse = await fetch(sentUrl, { method: "DELETE" });
    if (sentResponse.ok) {
      console.log("🔥 Sent email deleted successfully");
    } else {
      console.error("❌ Failed to delete sent email");
    }

      dispatch(addDeleteEmail(email.id)); // Remove from Redux store
      // After deleting the email, force a re-fetch of the inbox


    ;
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };
  
  return (
    <div className="mail-page">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#">Yahoo! Mail</Navbar.Brand>
      </Navbar>

      <Container fluid>
        <Row>
          <Col xs={2} className="sidebar">
            <Button variant="primary" className="w-100" onClick={() => history.push("/mail")}>
              Compose
            </Button>
            <Button variant="secondary" className="w-100" onClick={fetchInboxEmails}>
              Inbox ({unreadCount})
            </Button>
          </Col>

          <Col xs={10} className="content-area">
            <h3>Inbox ({unreadCount})</h3>
            <ListGroup>
              {emails.length === 0 ? (
                <p>No mails available.</p>
              ) : (
          emails.map((mail) => (
                  <ListGroup.Item key={mail.id} className="mail-item" onClick={() => handleEmailClick(mail)}>
                    <Row>
                      <Col xs={1}>{mail.read ? "" : "🔵"}</Col>
                      <Col xs={2}><strong>{mail.from}</strong></Col>
                      <Col xs={2}>{mail.subject}</Col>
                      <Col xs={2}>{mail.body}</Col>
                      <Col xs={2}>{mail.timestamp}</Col>
                      <Col xs={1}>
                        <Button variant="danger" size="sm" onClick={(e) => { 
                          e.stopPropagation();
                          handleDeleteEmail(mail);
                        }}>
                          🗑️
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InboxPage;
