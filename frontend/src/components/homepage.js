import React from "react";
import "./homepage.css";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="header">
        <div className="logo">🍔</div>
        <div className="brand-name">Story Pal</div>
        <div className="profile-icon"></div>
      </header>

      {/* Banner */}
      <div className="banner-container">
        <img
          src="Ad.png"
          alt="Add Image"
          className="banner-image animate-fade-in"
        />

        <div className="carousel-indicators">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              className={`indicator ${index === 0 ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="animate-fade-in">
        <button className="action-button" onClick={() => navigate("/input")}>
          <span>✏️</span>
          Let's Imagine Together!
        </button>

        <button
          className="action-button"
          onClick={() => navigate("/story-mode")}
        >
          <span>🎧</span>
          Your Magical Story Awaits!
        </button>
      </div>

      {/* Footer Message */}
      <div className="footer-message animate-fade-in">
        <p>
          "Psst... want to know a secret? Every story is special, just like you!
          ✨"
        </p>
      </div>
    </div>
  );
};

export default Homepage;
