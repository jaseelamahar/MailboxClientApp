import React, { useState, useEffect } from "react";

export const AuthContext = React.createContext({
  token: null,
  email: null,
  isLoggedIn: false,
  login: (token, email) => {},
  logout: () => {},
});

export const AuthContextProvider = (props) => {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("userEmailId");
    if (storedToken) {
      setToken(storedToken);
      setEmail(storedEmail);
    }
  }, []);

  const loginHandler = (token, email) => {
    setToken(token);
    setEmail(email);
    localStorage.setItem("token", token);
    localStorage.setItem("userEmailId", email); 
  };

  const logoutHandler = () => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userEmailId"); 
  };

  const contextValue = {
    token: token,
    email: email,
    isLoggedIn: !!token,
    login: loginHandler,
    logout: logoutHandler,
  };

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};
