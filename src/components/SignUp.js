import React, { useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { useHistory } from "react-router-dom";

const SignUp = () => {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordRef = useRef();
  const history=useHistory();

  const submitHandler = (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;
    const enteredConfirmPassword = confirmPasswordRef.current.value;

    if (enteredPassword !== enteredConfirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDjufWpGu_sN_jUYZ8SnG7cIFMSJRhVYm8',
      {
        method: 'POST',
        body: JSON.stringify({
          email: enteredEmail,
          password: enteredPassword,
          returnSecureToken: true,
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    )
      .then((response) => response.ok ? response.json() : response.json().then((data) => { throw new Error(data.error?.message || 'Signup failed!'); }))
      .then((data) => {
        console.log('User signed up:', data);
        alert('Signup successful!');
      })
      .catch((error) => alert(error.message));
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
<Card className="p-3 shadow-sm w-50" style={{ maxWidth: '300px' }}>
    <Card.Body>
      <h3 className="text-center mb-4">SignUp</h3>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-2">
          <Form.Control type="email" placeholder="Enter email" ref={emailInputRef} required />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Control type="password" placeholder="Enter password" ref={passwordInputRef} required />
        </Form.Group>

        <Form.Group className="mb-2" >
          <Form.Control type="password" placeholder="Confirm password" ref={confirmPasswordRef} required />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-40 rounded-2">Sign Up</Button>
      </Form>
    </Card.Body>
  </Card>

  
  <div className="mt-3 p-2 border rounded text-center w-50" style={{ maxWidth: '300px',backgroundColor: '#e0f7fa' }}>
    <span>Have an account? </span>
    <Button variant="link" size="sm" onClick={() => history.push("/login")}>Login</Button>
  </div>
</div>
  )
}

export default SignUp;
