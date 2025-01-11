// NavBar.jsx
import React, { useState } from "react";
import { Home, BookOpen, PenTool } from "lucide-react";
import "./NavBar.css";

const NavBar = ({ onNavigate }) => {
  const [activePath, setActivePath] = useState("/");

  const navItems = [
    { icon: <Home className="nav-icon" />, label: "Home", path: "/" },
    { icon: <PenTool className="nav-icon" />, label: "Create", path: "/input" },
    {
      icon: <BookOpen className="nav-icon" />,
      label: "Stories",
      path: "/story-mode",
    },
    {
      icon: <BookOpen className="nav-icon" />,
      label: "Subscription",
      path: "/pay",
    },
  ];

  const handleNavClick = (path) => {
    setActivePath(path);
    onNavigate?.(path);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <button
                onClick={() => handleNavClick(item.path)}
                className={`nav-button ${
                  activePath === item.path ? "active" : ""
                }`}
              >
                <div className="nav-icon-wrapper">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
                <div className="nav-indicator" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
