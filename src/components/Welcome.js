import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import useMailApi from "./useMailApi";

const Welcome = () => {
  const { email: loggedInEmail } = useContext(AuthContext);
  const { emails } = useMailApi();
  const [userEmails, setUserEmails] = useState([]);

  useEffect(() => {
    if (loggedInEmail) {
      setUserEmails(emails.filter((email) => email.to === loggedInEmail));
    }
  }, [loggedInEmail, emails]);

  return (
    <div className="container mt-4">
    <h1 className="text-primary">Welcome</h1>
    <h2 className="text-secondary">Your Emails</h2>
    {userEmails.length === 0 ? (
      <p className="alert alert-warning">No emails found.</p>
    ) : (
      <table className="table table-striped table-bordered mt-3">
        <thead className="thead-dark">
          <tr>
            <th>To</th>
            <th>Subject</th>
            <th>Body</th>
          </tr>
        </thead>
        <tbody>
          {userEmails.map((email) => (
            <tr key={email.firebaseKey}>
              <td>{email.to}</td>
              <td>{email.subject}</td>
              <td>{email.body}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
  
  );
};

export default Welcome;
