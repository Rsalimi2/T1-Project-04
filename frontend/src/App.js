import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { StudentList } from "./components/ListStudents";
import { LoginPage } from "./components/Login";
import { AddStudent } from "./components/AddStudent";
import { EditStudent } from "./components/EditStudent";

import "./styles.css"; // Import the CSS file

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (loggedIn) => {
    setIsLoggedIn(loggedIn);
  };

  return (
    <Router>
      <div className="container"> {/* Add a global container */}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/home" /> : <LoginPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/home"
            element={isLoggedIn ? <StudentList /> : <Navigate to="/" />}
          />
          <Route
            path="/add"
            element={isLoggedIn ? <AddStudent /> : <Navigate to="/" />}
          />
          <Route
            path="/edit/:id"
            element={isLoggedIn ? <EditStudent /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;