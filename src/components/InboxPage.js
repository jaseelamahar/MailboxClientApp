import React, { useState} from "react";
import { useHistory } from "react-router-dom";
import { Navbar, Button, Container, Row, Col, ListGroup } from "react-bootstrap";
import "./InboxPage.css"

const firebaseURL = "https://mailboxclient-7f072-default-rtdb.firebaseio.com";

// Format email to handle Firebase paths
const formatEmailForFirebase = (email) => email.replace(/\./g, ",");

const InboxPage = () => {
  const [inboxEmails, setInboxEmails] = useState([]);
  const [sentMails, setSentMails] = useState([]);
  const history = useHistory();

  
  

  // Fetch Inbox Mails
  const fetchInboxEmails = async () => {
    try {
      const receiverEmail = "receiver@gmail.com"; // Use actual receiver's email
      const formattedReceiverEmail = formatEmailForFirebase(receiverEmail);
  
      const response = await fetch(`${firebaseURL}/emails/${formattedReceiverEmail}/inbox.json`);
      console.log('Response:', response);
  
      const text = await response.text();
      console.log('Response Text:', text);
  
      const data = text ? JSON.parse(text) : null;
      console.log('Fetched Inbox Data:', data);
  
      if (!data || Object.keys(data).length === 0) {
        console.warn('No inbox emails found or inbox is empty.');
        setInboxEmails([]);
      } else {
        setInboxEmails(Object.values(data));
      }
    } catch (error) {
      console.error('Error fetching inbox emails:', error);
    }
  };
  
  // Fetch Sent Mails
  const fetchSentMails = async () => {
    try {
      const senderEmail= "test@gmail.com";
      const formattedSenderEmail = formatEmailForFirebase(senderEmail);
      const response = await fetch(`${firebaseURL}/emails/${formattedSenderEmail}/sent.json`);
      const data = await response.json();

      if (data) {
        const mailsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setSentMails(mailsArray);
      } else {
        setSentMails([]);
      }
    } catch (error) {
      console.error("Error fetching sent mails:", error);
    }
  };

  

  const handleComposeClick = () => {
    history.push("/mail");
  };

  return (
    <div className="mail-page">
    {/* Navbar */}
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="#">Yahoo! Mail</Navbar.Brand>
    </Navbar>

    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col xs={2} className="sidebar">
          <Button variant="primary"  className="w-100" onClick={handleComposeClick}>Compose</Button>
          <Button variant="secondary"  className="w-100" onClick={fetchInboxEmails}>Inbox</Button>
          <Button variant="secondary"  className="w-100" onClick={fetchSentMails}>Sent</Button>
        </Col>

    
       {/* Content Area */}
       <Col xs={10} className="content-area">
            <h3>Inbox</h3>
            <ListGroup>
              {inboxEmails.length === 0 ? (
                <p>No mails available.</p>
              ) : (
                inboxEmails.map((mail) => (
                  <ListGroup.Item key={mail.id} className="mail-item">
                    <Row>
                      <Col xs={3}><strong>{mail.from}</strong></Col>
                      <Col xs={6}>{mail.body}</Col>
                      <Col xs={3}>{mail.timestamp}</Col>
                    </Row>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>

          <h3>Sent</h3>
          <ListGroup>
            {sentMails.length === 0 ? (
              <p>No sent mails available.</p>
            ) : (
              sentMails.map((mail) => (
                <ListGroup.Item key={mail.id}>
                  <strong>To:</strong> {mail.to} <br />
                  <strong>Subject:</strong> {mail.subject} <br />
                  <strong>Text:</strong> {mail.body}
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