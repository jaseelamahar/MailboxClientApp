import React, { useRef, useContext ,useState} from "react";
import "./Login.css"
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { AuthContext } from "./auth-context";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

const Login = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const authCtx = useContext(AuthContext);
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const history=useHistory()

  const submitHandler = async (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    try {
      const response = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDjufWpGu_sN_jUYZ8SnG7cIFMSJRhVYm8",
        {
          method: "POST",
          body: JSON.stringify({
            email: enteredEmail,
            password: enteredPassword,
            returnSecureToken: true,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        alert("Login successful!");

        localStorage.setItem("token", data.idToken);
        localStorage.setItem("userEmailId", data.email);

        authCtx.login(data.idToken, data.email); // Pass email to AuthContext
        history.push('/welcome');
      } else {
        alert("Login failed: " + (data.error?.message || "Unknown error"));
      }
    } catch (error) {
      alert("Something went wrong: " + error.message);
    }
  };
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100" >
      <Card className="p-3 shadow-sm w-50" style={{ maxWidth: '300px' }} >
      <Card.Body>
          <h3 className="text-center mb-4">Login</h3>
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-2" >
              <Form.Control style={{backgroundColor:"black",borderRadius:"50px",color:"white"}}
                type="email"
                placeholder="Enter email"
                ref={emailInputRef}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2 position-relative">
            <Form.Control  style={{backgroundColor:"black",borderRadius:"50px",color:"white"}}
               type={passwordVisible ? 'text' : 'password'}
                placeholder="Enter password"
               ref={passwordInputRef}
                  className="black-input"
                    required
                    />

              <div
                className="password-eye-icon position-absolute"
                onClick={togglePasswordVisibility}
                style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer',color:"white" }}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </div>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 rounded-2">
              Login
            </Button>
            <div>
            <Link>Forgot password</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <div
        className="mt-3 p-2 border rounded text-center w-50"
        style={{ maxWidth: "300px", backgroundColor: "#e0f7fa" }}
      >
        <span> Don't have an account? </span>
        <Button variant="link" size="sm">
          SignUp
        </Button>
      </div>
    </div>
  );
};

export default Login;

