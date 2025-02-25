import React, { useEffect, useState,useContext } from 'react';
import { AuthContext } from './auth-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInboxEmails, deleteEmail, markAsRead } from './inboxSlice';
import { fetchSentEmails, deleteSentEmail,marksentAsRead } from './sentSlice';
import { Navbar, Container, Row, Col, Button, ListGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const InboxPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isSent, setIsSent] = useState(false); // State to toggle between Inbox and Sent
  const userId = 'yourUserId';
// Replace with actual user ID

  // Selectors for inbox and sent emails
  const inboxEmails = useSelector((state) => state.inbox.emails);
  const sentEmails = useSelector((state) => state.sent.emails);

  const loading = useSelector((state) => state.inbox.loading || state.sent.loading);
  const error = useSelector((state) => state.inbox.error || state.sent.error);

  // Fetch emails on component mount
  useEffect(() => {
    if (isSent) {
      dispatch(fetchSentEmails());
    } else {
      dispatch(fetchInboxEmails());
    }
  }, [dispatch, isSent]);

  const handleEmailClick = (email) => {
    if (!email.read) {
      if (isSent) {
        dispatch(marksentAsRead({ userId, firebaseKey: email.firebaseKey })); // Sent emails should also be marked as read
      } else {
        dispatch(markAsRead(email.firebaseKey)); // Inbox emails
      }
    }
  };
  

  const handleEmailDoubleClick = (email) => {
    history.push(`/mail/${email.firebaseKey}`); // Use firebaseKey instead of id
  };

  const handleDeleteEmail = (email) => {
    console.log("Email object before deletion:", email);
    if (isSent) {
      dispatch(deleteSentEmail({ userId, firebaseKey: email.firebaseKey })); // Use firebaseKey
    } else {
      dispatch(deleteEmail(email));
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
            <Button
              variant={isSent ? 'secondary' : 'primary'}
              className="w-100"
              onClick={() => setIsSent(false)} // Switch to Inbox
            >
              Inbox
            </Button>
            <Button
              variant={isSent ? 'primary' : 'secondary'}
              className="w-100"
              onClick={() => setIsSent(true)} // Switch to Sent
            >
              Sent
            </Button>
          </Col>

          <Col xs={10} className="content-area">
            <h3>{isSent ? 'Sent Emails' : 'Inbox'}</h3>

            {loading ? (
              <p>Loading emails...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              <ListGroup>
                {(isSent ? sentEmails : inboxEmails).length === 0 ? (
                  <p>No mails available.</p>
                ) : (
                  (isSent ? sentEmails : inboxEmails).map((mail) => (
                    <ListGroup.Item
                      key={mail.firebaseKey} // Use firebaseKey instead of id
                      className="mail-item"
                      onClick={() => handleEmailClick(mail)}
                      onDoubleClick={() => handleEmailDoubleClick(mail)}
                    >
                      <Row>
                        <Col xs={1}>{mail.read ? '' : '🔵'}</Col>
                        <Col xs={2}>{mail.subject}</Col>
                        <Col xs={2}>{mail.body}</Col>
                        <Col xs={2}>{mail.timestamp}</Col>
                        <Col xs={1}>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEmail(mail);
                            }}
                          >
                            🗑️
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InboxPage;
