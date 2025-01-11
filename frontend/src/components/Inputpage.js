import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Inputpage.css";

const Inputpage = () => {
  const [isListening, setIsListening] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [animation, setAnimation] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const handleGenerate = async () => {
    setIsGenerating(true);
    // Add your generation logic here
    // After generation is complete:

    setIsGenerating(false);
  };

  useEffect(() => {
    let animationFrame;
    if (isListening) {
      const animate = () => {
        setAnimation((prev) => (prev + 1) % 100);
        animationFrame = requestAnimationFrame(animate);
      };
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isListening]);

  return (
    <div className="story-input-container">
      <button className="back-button" onClick={() => navigate("/")}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <div className="header-section">
        <div className="magic-text">
          <span>💡</span> Let's make magic together!
        </div>
        <h1 className="main-title">Say Something About Your Story</h1>
        <p className="subtitle">✨ What's your story like?</p>
      </div>

      <textarea
        className="text-input"
        value={storyText}
        onChange={(e) => setStoryText(e.target.value)}
        placeholder="Type your story info here..."
      />
      <button
        className="generate-button"
        onClick={handleGenerate}
        disabled={!storyText.trim() || isGenerating}
      >
        {isGenerating ? (
          <span className="loading-spinner">⌛</span>
        ) : (
          <>✨ Generate Story</>
        )}
      </button>
      <div className={`voice-input-section ${isListening ? "listening" : ""}`}>
        <button
          className="mic-button"
          onClick={() => setIsListening(!isListening)}
        >
          {isListening ? <span>■</span> : <span>🎤</span>}
        </button>

        {isListening && (
          <div className="voice-animation">
            <div className="voice-animation-bars">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="animation-bar"
                  style={{
                    height: `${
                      20 + Math.sin((animation + i * 30) * 0.1) * 20
                    }px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <p className="status-text">
          {isListening ? "Listening..." : "Tap microphone to start recording"}
        </p>
      </div>
    </div>
  );
};

export default Inputpage;
