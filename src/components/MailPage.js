import React, { useState, useEffect, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const firebaseURL = "https://mailboxclient-7f072-default-rtdb.firebaseio.com";

const formatEmailForFirebase = (email) => email.replace(/\./g, ",");

const MailPage = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [inboxEmails, setInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const isMountedRef = useRef(true);

  const userEmail = "test@gmail.com";
  const formattedUserEmail = formatEmailForFirebase(userEmail);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchInboxEmails = async () => {
      try {
        const response = await fetch(`${firebaseURL}/emails/${formattedUserEmail}/inbox.json`);
        if (!response.ok) throw new Error("Failed to fetch inbox");

        const data = await response.json();
        if (data && isMountedRef.current) {
          setInboxEmails(Object.values(data));
        }
      } catch (error) {
        console.error("Inbox Fetch Error:", error);
      }
    };

    fetchInboxEmails();

    return () => {
      isMountedRef.current = false;
    };
  }, [formattedUserEmail]);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchSentEmails = async () => {
      try {
        const response = await fetch(`${firebaseURL}/emails/${formattedUserEmail}/sent.json`);
        if (!response.ok) throw new Error("Failed to fetch sent emails");

        const data = await response.json();
        if (data && isMountedRef.current) {
          setSentEmails(Object.values(data));
        }
      } catch (error) {
        console.error("Sentbox Fetch Error:", error);
      }
    };

    fetchSentEmails();

    return () => {
      isMountedRef.current = false;
    };
  }, [formattedUserEmail]);

  const handleSendMail = async () => {
    const receiverEmail = "receiver@gmail.com";
    const formattedReceiverEmail = formatEmailForFirebase(receiverEmail);

    const newEmail = {
      to: receiverEmail,
      from: userEmail,
      subject: "Test Subject",
      body: editorState.getCurrentContent().getPlainText(),
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(`${firebaseURL}/emails/${formattedReceiverEmail}/inbox.json`, {
        method: "POST",
        body: JSON.stringify(newEmail),
        headers: { "Content-Type": "application/json" },
      });

      await fetch(`${firebaseURL}/emails/${formattedUserEmail}/sent.json`, {
        method: "POST",
        body: JSON.stringify(newEmail),
        headers: { "Content-Type": "application/json" },
      });

      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Form style={{ flex: 1, padding: "10px" }}>
        <Form.Group>
          <Form.Label className="text-start d-block">To</Form.Label>
          <Form.Control type="email" placeholder="Test mail" />
        </Form.Group>

        <div style={{ minHeight: "300px", border: "1px solid #ccc", padding: "5px" }}>
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            placeholder="This is a test mail"
            toolbar={{
              options: ["inline", "blockType", "fontSize", "list", "textAlign", "link", "emoji", "image"],
            }}
          />
        </div>
      </Form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "fixed",
          bottom: "0",
          left: "0",
          right: "0",
          background: "#f8f9fa",
          padding: "10px",
          borderTop: "1px solid #ccc",
        }}
      >
        <Button type="submit" className="rounded-2" onClick={handleSendMail}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default MailPage;