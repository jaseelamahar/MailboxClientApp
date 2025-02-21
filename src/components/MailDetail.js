import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const firebaseURL = "https://mailboxclient-7f072-default-rtdb.firebaseio.com";

const MailDetail = () => {
  const { id } = useParams();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const fetchEmail = async () => {
      const response = await fetch(`${firebaseURL}/emails.json`);
      const data = await response.json();

      const userEmail = "a@gmail.com".replace(/\./g, ",");
      const inbox = data[userEmail]?.inbox || {};
      const foundEmail = Object.values(inbox).find((email) => String(email.id) === String(id));

      setEmail(foundEmail || null);
    };

    fetchEmail();
  }, [id]);

  if (!email) {
    return <p style={{ textAlign: "center", padding: "20px" }}>Loading email...</p>;
  }

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "10px auto", /* Reduced margin to move it up */
      padding: "15px", 
      border: "1px solid #ccc", 
      borderRadius: "8px", 
      background: "#f9f9f9",
      position: "relative", /* Ensures it doesn't stick to the bottom */
      top: "-200px" /* Moves it up slightly */
    }}>
    
      <h2 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>{email.subject || "No Subject"}</h2>
      <p><strong>From:</strong> {email.from || "Unknown"}</p>
      <p><strong>To:</strong> {email.to || "Unknown"}</p>
      <div style={{ marginTop: "15px", padding: "10px", background: "#fff", borderRadius: "5px", minHeight: "100px", border: "1px solid #ddd" }}>
        {email.body || "No Content"}
      </div>
    </div>
  );
};

export default MailDetail;
