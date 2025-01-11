import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Storypage.css";

const Storypage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the passed story data
  const { title, subtitle, text, audio_url, total_time } = location.state || {
    title: "Default Story Title",
    subtitle: "Default Subtitle",
    text: "No story text provided.",
    audio_url: "",
    total_time: 0,
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  // Construct full audio URL if it's a relative path
  const fullAudioUrl = audio_url.startsWith('http') 
    ? audio_url 
    : `http://localhost:8080${audio_url}`;

  useEffect(() => {
    console.log('Audio URL:', fullAudioUrl); // Debug log
    
    if (audioRef.current) {
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setAudioError(e.message);
      });
    }
  }, [fullAudioUrl]);

  const calculateProgress = () => {
    return total_time > 0 ? (currentTime / total_time) * 100 : 0;
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio playback error:', error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      audio.addEventListener("timeupdate", updateTime);
      return () => audio.removeEventListener("timeupdate", updateTime);
    }
  }, []);

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
        <h1 className="story-title">{title}</h1>
        <p className="story-subtitle">{subtitle}</p>
      </div>

      {/* Audio Debug Info */}
      {audioError && (
        <div className="audio-error" style={{ color: 'red', margin: '10px' }}>
          Audio Error: {audioError}
        </div>
      )}

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(total_time)}</span>
        </div>
      </div>

      {/* Play/Pause Button */}
      <button className="play-button" onClick={toggleAudio}>
        {isPlaying ? "Pause" : "Play"}
      </button>

      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={fullAudioUrl}
        onLoadedMetadata={() => console.log('Audio metadata loaded')}
      />

      {/* Story Text */}
      <div className="story-text-container">
        {text.split("\n").map((paragraph, index) => (
          <p key={index} className="story-paragraph">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default Storypage;