import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEmails, markAsRead } from "./inboxSlice";
import { Navbar, Container, Row, Col, Button, ListGroup } from "react-bootstrap";
import { useHistory } from "react-router-dom";

const firebaseURL = "https://mailboxclient-7f072-default-rtdb.firebaseio.com";

const InboxPage = () => {
  const dispatch = useDispatch();
  const emails = useSelector((state) => state.inbox.emails);
  const unreadCount = useSelector((state) => state.inbox.unreadCount);
  const history = useHistory();

  useEffect(() => {
    fetchInboxEmails();
  }, [dispatch]);

  const fetchInboxEmails = async () => {
    const response = await fetch(`${firebaseURL}/emails.json`);
    const data = await response.json();
    console.log("Fetched Firebase Data:", data); // Debugging

    if (data) {
      const emailsArray = Object.keys(data).flatMap((userId) => {
        const userEmails = data[userId]?.inbox; // Extract inbox data
        if (!userEmails) return [];

        return Object.keys(userEmails).map((emailId) => ({
          id: emailId, // Store the actual Firebase ID
          ...userEmails[emailId],
        }));
      });

      console.log("Processed Emails for Redux:", emailsArray); // Debugging
      dispatch(setEmails(emailsArray));
    }
  };

  const handleEmailClick = async (email) => {
    console.log("Email ID in InboxPage:", email.id);

    if (!email.read) {
      await fetch(`${firebaseURL}/emails/${email.id}.json`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      });
      dispatch(markAsRead(email.id));
      fetchInboxEmails();
    }
    console.log("Email ID in InboxPage:", email.id);
    history.push(`mail/${email.id}`); // Ensure correct ID is passed
  };

  return (
    <div className="mail-page">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#">Yahoo! Mail</Navbar.Brand>
      </Navbar>

      <Container fluid>
        <Row>
          <Col xs={2} className="sidebar">
            <Button variant="primary" className="w-100"  onClick={() => history.push("/mail")}>Compose</Button>
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
