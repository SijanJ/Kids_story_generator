import React from "react";
import { useNavigate } from "react-router-dom";
import "./Storypage.css";

const Storypage = () => {
  const navigate = useNavigate();

  // Mock data - replace with your backend data
  const storyData = {
    title: "Story ko title",
    subtitle: "story ko sub title",
    currentTime: "00:00",
    totalTime: "06:09",
    text: ["main story yeta"],
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const current = storyData.currentTime.split(":").map(Number);
    const total = storyData.totalTime.split(":").map(Number);
    const currentSeconds = current[0] * 60 + current[1];
    const totalSeconds = total[0] * 60 + total[1];
    return (currentSeconds / totalSeconds) * 100;
  };

  return (
    <div className="story-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      {/* Title Section */}
      <div className="title-section">
        <h1 className="story-title">{storyData.title}</h1>
        <p className="story-subtitle">{storyData.subtitle}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <div className="time-display">
          <span>{storyData.currentTime}</span>
          <span>{storyData.totalTime}</span>
        </div>
      </div>

      {/* Animation Area */}
      <div className="animation-area">
        <div className="animation-placeholder">
          Gif Animation Area + Who is speaking
        </div>
      </div>

      {/* Story Text */}
      <div className="story-text-container">
        {storyData.text.map((paragraph, index) => (
          <p key={index} className="story-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Storypage;
