import "./App.css";
import Homepage from "./components/homepage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inputpage from "./components/Inputpage";
import Storypage from "./components/Storypage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/input" element={<Inputpage />} />
        <Route path="/story-mode" element={<Storypage />} />
      </Routes>
    </Router>
  );
}

export default App;
