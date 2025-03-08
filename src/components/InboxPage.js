import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSentEmails, deleteSentEmail, marksentAsRead } from "./sentSlice";
import { Navbar, Container, Row, Col, Button, ListGroup } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import useMailApi from "./useMailApi"; 

const InboxPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isSent, setIsSent] = useState(false);
  const userId = "yourUserId"; 

  // Custom hook for inbox emails
  const { emails: inboxEmails, unreadCount, loading, error, fetchInboxEmails, markAsRead, deleteEmail } = useMailApi();

  // Redux selectors for sent emails
  const sentEmails = useSelector((state) => state.sent.emails);
  const sentLoading = useSelector((state) => state.sent.loading);
  const sentError = useSelector((state) => state.sent.error);
  const loggedInUserEmail = localStorage.getItem("userEmailId");
  // Poll emails every 2 seconds
  useEffect(() => {
    const fetchEmails = () => {
      if (isSent) {
        dispatch(fetchSentEmails());
      } else {
        fetchInboxEmails(loggedInUserEmail); 
      }
    };

    fetchEmails(); // Initial fetch

    const interval =setInterval(() => {
      fetchEmails();
    }, 100000);

    return () => clearInterval(interval);
  }, [dispatch, isSent,loggedInUserEmail,fetchInboxEmails]);

  const handleEmailClick = (email) => {
    if (!email.read) {
      if (isSent) {
        dispatch(marksentAsRead({ userId, firebaseKey: email.firebaseKey }));
      } else {
        markAsRead(email); 
      }
    }
  };

  const handleDeleteEmail = (email,e) => {
    e.stopPropagation();
    console.log("Email object before deletion:", email);
    if (isSent) {
      dispatch(deleteSentEmail({ userId: email.userId, firebaseKey: email.firebaseKey }));
;
    } else {
      deleteEmail(email); // Use custom hook instead of Redux
    }
  };

  return (
    <div className="mail-page">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#"> Mail</Navbar.Brand>
      </Navbar>

      <Container fluid>
        <Row>
          <Col xs={2} className="sidebar">
            <Button variant="primary" className="w-100" onClick={() => history.push("/mail")}>
              Compose
            </Button>
            <Button variant={isSent ? "secondary" : "primary"} className="w-100" onClick={() => setIsSent(false)}>
              Inbox ({unreadCount > 0 ? unreadCount : 0})
            </Button>
            <Button variant={isSent ? "primary" : "secondary"} className="w-100" onClick={() => setIsSent(true)}>
              Sent
            </Button>
          </Col>

          <Col xs={10} className="content-area">
            <h3>{isSent ? "Sent Emails" : "Inbox"}</h3>

            {loading || sentLoading ? (
              <p>Loading emails...</p>
            ) : error || sentError ? (
              <p>Error: {error || sentError}</p>
            ) : (
              <ListGroup>
                {(isSent ? sentEmails : inboxEmails).length === 0 ? (
                  <p>No mails available.</p>
                ) : (
                  (isSent ? sentEmails : inboxEmails).map((mail) => (
                    <ListGroup.Item
                      key={mail.firebaseKey}
                      className="mail-item"
                      onClick={() => handleEmailClick(mail)}
                      onDoubleClick={() => history.push(`/mail/${mail.firebaseKey}`)}
                    >
                      <Row>
                        <Col xs={1}>{mail.read ? "" : "🔵"}</Col>
        

                        <Col xs={2}>{mail.to}</Col>
                         <Col xs={2}>{mail.subject}</Col>
                        <Col xs={2}>{mail.body}</Col>
                        <Col xs={2}>{mail.timestamp}</Col>
                        <Col xs={1}>
                        { (isSent ? sentEmails : inboxEmails).length > 0 && (
    <Button
      variant="danger"
      size="sm"
      onClick={(e) => handleDeleteEmail(mail, e)}
    >
      🗑️
    </Button>
  )}

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
