import React, { useContext,useEffect} from "react";
import "./App.css";
import SignUp from "./components/SignUp";
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from "react-router-dom";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
import MailPage from "./components/MailPage";
import InboxPage from "./components/InboxPage";
import MailDetail from "./components/MailDetail";
import { AuthContext } from "./components/auth-context";

const App = () => {
  const authCtx = useContext(AuthContext);
  console.log("isLoggedIn:", authCtx.isLoggedIn);

  const history = useHistory();
  

useEffect(() => {
  if (!authCtx.isLoggedIn) {
    history.push("/login");
  }
}, [authCtx.isLoggedIn, history]);


  const handleLogout = () => {
    authCtx.logout();
    
  };

  return (
    <div className="App">
      <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
  <div className="container-fluid">
    <Link className="navbar-brand" to="/signup">Sign Up</Link>
    <Link className="navbar-brand" to="/login">Login</Link>
    <Link className="navbar-brand" to="/inbox">Inbox</Link>
    {authCtx.isLoggedIn && (
      <>
        <Link className="navbar-brand" to="/welcome">Welcome</Link>
        <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
      </>
    )}
  </div>
</nav>

        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/login" component={Login} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/mail" exact component={MailPage} />
          <Route path="/inbox" component={InboxPage} />
          <Route path="/mail/:id" component={MailDetail} />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
