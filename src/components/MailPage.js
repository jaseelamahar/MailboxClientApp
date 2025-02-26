import React, { useState } from "react";
import { useDispatch } from "react-redux";
import  {addSentEmail}  from "./sentSlice";
import { Form, Button } from "react-bootstrap";
import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const firebaseURL = "https://mailboxclient-7f072-default-rtdb.firebaseio.com";
const formatEmailForFirebase = (email) => email.replace(/\./g, ",");

const MailPage = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const dispatch = useDispatch();

  const userEmail = "test@gmail.com";
  const formattedUserEmail = formatEmailForFirebase(userEmail);

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim()) {
      alert("Recipient and Subject are required.");
      return;
    }

    const formattedReceiverEmail = formatEmailForFirebase(recipient);

    const newEmail = {
      id: Date.now().toString(),
      to: recipient,
      from: userEmail,
      subject,
      body: editorState.getCurrentContent().getPlainText(),
      timestamp: new Date().toISOString(),
      read: false,
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

      dispatch(addSentEmail(newEmail));

      setRecipient("");
      setSubject("");
      setEditorState(EditorState.createEmpty());
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Form style={{ flex: 1, padding: "10px" }}>
        <Form.Group>
          <Form.Label className="text-start d-block">To</Form.Label>
          <Form.Control
            type="email"
            placeholder="Test Mail"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label className="text-start d-block">Subject</Form.Label>
          <Form.Control
            type="text"
            placeholder="This is a test mail"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </Form.Group>

        <div style={{ minHeight: "300px", border: "1px solid #ccc", padding: "5px" }}>
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            placeholder="Write your message here..."
            toolbar={{
              options: ["inline", "blockType", "fontSize", "list", "textAlign", "link", "emoji", "image"],
            }}
          />
        </div>
      </Form>

      {/* Footer bar with Send button */}
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
        <Button type="button" className="rounded-2" onClick={handleSendMail}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default MailPage;
