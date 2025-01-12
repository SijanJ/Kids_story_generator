import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Storypage.css";

const Storypage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { title, subtitle, text, audio_url, total_time, images } =
    location.state || {
      title: "Default Story Title",
      subtitle: "Default Subtitle",
      text: "No story text provided.",
      audio_url: "",
      total_time: 0,
      images: [],
    };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioError, setAudioError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const audioRef = useRef(null);
  const imageTransitionInterval = useRef(null);

  const fullAudioUrl = audio_url.startsWith("http")
    ? audio_url
    : `http://localhost:8080${audio_url}`;

  useEffect(() => {
    if (isPlaying && images?.length > 0) {
      const intervalTime = (total_time * 1000) / images.length;
      imageTransitionInterval.current = setInterval(() => {
        setIsImageTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
          );
          setIsImageTransitioning(false);
        }, 500);
      }, intervalTime);
    }

    return () => {
      if (imageTransitionInterval.current) {
        clearInterval(imageTransitionInterval.current);
      }
    };
  }, [isPlaying, images, total_time]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentImageIndex(0);
        if (imageTransitionInterval.current) {
          clearInterval(imageTransitionInterval.current);
        }
      });

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("ended", () => {});
      };
    }
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        if (imageTransitionInterval.current) {
          clearInterval(imageTransitionInterval.current);
        }
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio playback error:", error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="story-container">
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
        Back to Home
      </button>

      <div className="content-wrapper">
        <div className="title-section">
          <h1 className="story-title">{title}</h1>
          <p className="story-subtitle">{subtitle}</p>
        </div>

        <div className="media-section">
          <div className="image-carousel">
            {images && images.length > 0 && (
              <div className="image-container">
                <img
                  src={images[currentImageIndex]?.url}
                  alt={`Story illustration ${currentImageIndex + 1}`}
                  className={`story-image ${
                    isImageTransitioning ? "fade" : ""
                  }`}
                />
                <div className="image-overlay" />
                <div className="image-indicators">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${
                        index === currentImageIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="audio-controls">
            <button
              className={`play-button ${isPlaying ? "playing" : ""}`}
              onClick={toggleAudio}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentTime / total_time) * 100}%` }}
                />
              </div>
              <div className="time-display">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(total_time)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="story-text-container">
          {text.split("\n").map((paragraph, index) => (
            <p key={index} className="story-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={fullAudioUrl}
        onError={(e) => setAudioError("Error loading audio")}
      />
    </div>
  );
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default Storypage;
