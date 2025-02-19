import React from 'react';
import './App.css';
import SignUp from './components/SignUp';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Login from './components/Login';
import Welcome from './components/Welcome';
import MailPage from './components/MailPage';
import InboxPage from './components/InboxPage';


const App = () => {
  return (
    <div className="App">
      <Router>
        <nav>
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Login</Link>
          <Link to="/inbox">InboxPage</Link>

          
        </nav>

        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/welcome" component={Welcome}/>
        <Route path="/mail" component={MailPage}/>
        <Route path="/inbox" component={InboxPage}/>
      </Router>
    </div>
  );
};

export default App;

