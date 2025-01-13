import React, { useState, useEffect } from "react";
import "./homepage.css";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentFooterMessage, setCurrentFooterMessage] = useState(0);

  // Array of banner images
  const images = ["Ad1.png", "child4.jpg", "child5.jpg"];

  // Array of footer messages
  const footerMessages = [
    "Psst... want to know a secret? Every story is special, just like you! ✨",
    "Did you know? Imagination is the key to endless adventures! 🚀",
    "Every word has magic. What spell will you cast today? 🪄",
    "Once upon a time... starts the journey to your dreams! 🌟",
  ];

  // Array of games
  const games = [
    { name: "PopIt", icon: "🎮", isLocked: false },
    { name: "Ludo", icon: "🎲", isLocked: false },
    { name: "Puzzle", icon: "🧩", isLocked: true },
    { name: "Memory", icon: "🃏", isLocked: true },
    { name: "Quiz", icon: "❓", isLocked: true },
    { name: "Word Hunt", icon: "📝", isLocked: true },
    { name: "Math Fun", icon: "🔢", isLocked: true },
    { name: "Story Game", icon: "📚", isLocked: true },
  ];

  // Automatic slide transition every 5 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [images.length]);

  // Automatic footer message transition every 6 seconds
  useEffect(() => {
    const footerInterval = setInterval(() => {
      setCurrentFooterMessage(
        (prevMessage) => (prevMessage + 1) % footerMessages.length
      );
    }, 6000);
    return () => clearInterval(footerInterval);
  }, [footerMessages.length]);

  // Function to manually change slide
  const changeSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="homepage-container">
      {/* Banner */}
      <div className="banner-container">
        <img
          src={images[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className="banner-image animate-fade-in"
        />
        {/* Carousel Indicators */}
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => changeSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="animate-fade-in">
        <button className="action-button" onClick={() => navigate("/input")}>
          <span role="img" aria-label="pencil">
            ✏️
          </span>
          Let's Imagine Together!
        </button>
        <button
          className="action-button"
          onClick={() => navigate("/story-mode")}
        >
          <span role="img" aria-label="headphones">
            🎧
          </span>
          Your Magical Story Awaits!
        </button>
        <button className="action-button" onClick={() => navigate("/about")}>
          <span role="img" aria-label="notepad">
            📝
          </span>
          Tell Us About Yourself!
        </button>
      </div>
      <div className="footer-message animate-fade-in">
        <p>{footerMessages[currentFooterMessage]}</p>
      </div>

      {/* Game Interface Section */}
      <div className="game-section animate-fade-in">
        <h2 className="game-title">
          <span role="img" aria-label="game controller">
            🎮
          </span>
          Ready to Play and Show Your Skills?
        </h2>

        <div className="game-grid">
          {games.map((game, index) => (
            <div
              key={index}
              className={`game-card ${game.isLocked ? "locked" : ""}`}
            >
              <div className="game-icon">{game.icon}</div>
              <h3 className="game-name">
                {game.name}
                {game.isLocked && <span className="lock-icon"> 🔒</span>}
              </h3>
            </div>
          ))}
        </div>

        <div className="game-bonus-message">
          Complete stories to unlock more fun games! 🎉
        </div>
      </div>

      {/* Footer Message */}
    </div>
  );
};

export default Homepage;
