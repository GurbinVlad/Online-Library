import AuthPage from "./Components/RegistrationAndAuthorization/Authorization.js";
import RegPage from "./Components/RegistrationAndAuthorization/Registration.js";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AuthProvider from "./Components/Context/AuthProvider";
import MainMenu from "./Components/MainMenu/MainMenu.js";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/register" element={<RegPage />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
