// App.js
import "./App.css";
import Homepage from "./components/homepage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Inputpage from "./components/Inputpage";
import Storypage from "./components/Storypage";
import TopBar from "./components/TopBar"; // Add this import
import NavBar from "./components/NavBar";
import AboutPage from "./components/AboutPage";

// Create a wrapper component to handle navigation
const AppContent = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="app-container">
      <TopBar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/input" element={<Inputpage />} />
          <Route path="/story-mode" element={<Storypage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
      <NavBar onNavigate={handleNavigation} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
