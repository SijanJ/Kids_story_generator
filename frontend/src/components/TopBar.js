// TopBar.jsx
import React from "react";
import { User } from "lucide-react";
import "./TopBar.css";

const TopBar = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <div className="logo-emoji">🍔</div>
        <h1 className="logo-text">Story Pal</h1>
      </div>

      <div className="profile-container">
        <button className="profile-button">
          <User className="profile-icon" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
