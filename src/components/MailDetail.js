import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useMailApi from "./useMailApi";
import "bootstrap/dist/css/bootstrap.min.css";

const MailDetail = () => {
  const { id } = useParams();
  const { emails } = useMailApi();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const foundEmail = emails.find((mail) => mail.firebaseKey === id);
    if (foundEmail) setEmail(foundEmail);
  }, [emails, id]);

  if (!email) return <p className="text-center mt-4">Email not found.</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4">
        <h2 className="mb-3">{email.subject}</h2>
        <div className="row">
          <div className="col-md-6">
            <p><strong>From:</strong> {email.from}</p>
            <p><strong>To:</strong> {email.to}</p>
          </div>
         
        </div>
        <hr />
        <p className="mt-3">{email.body}</p>
      </div>
    </div>
  );
};

export default MailDetail;
