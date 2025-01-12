import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Inputpage.css";

const Inputpage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    storyTopic: "", // New field for story topic
    storyText: "",
    storyLength: "short",
    storySettings: "",
    language: "en",
    age: "all",
    imageStyle: "Storybook style",
  });
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition
      ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      : null;

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = formData.language;

    const handleResult = (event) => {
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setFormData((prev) => ({
            ...prev,
            storyText: prev.storyText + transcript + " ",
          }));
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onresult = handleResult;
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening, formData.language]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/generate-story/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      navigate("/story-mode", {
        state: {
          title: data.title,
          subtitle: data.subtitle,
          text: data.story,
          audio_url: data.audio_url,
          total_time: data.total_time,
          images: data.images,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while generating the story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="story-input-container">
      <div className="magic-text">
        <span>💡</span> Let's make magic together!
      </div>

      <div className="app-header">
        <h1 className="app-title">AI Story Generator</h1>
      </div>

      <div className="input-section">
        {/* New Story Topic Input */}
        <div className="input-group">
          <label className="input-label">Story Topic</label>
          <input
            type="text"
            className="text-input"
            value={formData.storyTopic}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, storyTopic: e.target.value }))
            }
            placeholder="Enter the main topic of your story..."
          />
        </div>

        <div className="textarea-wrapper">
          <textarea
            className="text-input"
            value={formData.storyText}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, storyText: e.target.value }))
            }
            placeholder="Describe your story in detail..."
          />
          <button
            className="mic-button"
            onClick={() => setIsListening(!isListening)}
            aria-label="Toggle voice input"
          >
            {isListening ? <span>■</span> : <span>🎤</span>}
          </button>
        </div>

        {isListening && (
          <div className="listening-indicator">
            <div className="listening-text">Listening...</div>
            <div className="listening-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="select-row">
          <div className="select-group">
            <label className="select-label">Language</label>
            <div className="select-wrapper">
              <select
                className="select-dropdown"
                value={formData.language}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, language: e.target.value }))
                }
              >
                <option value="en">English</option>
                <option value="ne">नेपाली</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          <div className="select-group">
            <label className="select-label">Story Length</label>
            <div className="select-wrapper">
              <select
                className="select-dropdown"
                value={formData.storyLength}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    storyLength: e.target.value,
                  }))
                }
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>

        <div className="select-row">
          <div className="select-group">
            <label className="select-label">Age Group</label>
            <div className="select-wrapper">
              <select
                className="select-dropdown"
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, age: e.target.value }))
                }
              >
                <option value="all">All Ages</option>
                <option value="0-2">0-2</option>
                <option value="2-5">2-5</option>
                <option value="5-7">5-7</option>
                <option value="7-12">7-12</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>

          <div className="select-group">
            <label className="select-label">Image Style</label>
            <div className="select-wrapper">
              <select
                className="select-dropdown"
                value={formData.imageStyle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageStyle: e.target.value,
                  }))
                }
              >
                <option value="Children's storybook illustration">
                  Storybook Style
                </option>
                <option value="Magical fairytale style">
                  Magical fairytale style
                </option>
                <option value="Watercolor painting style">Watercolor</option>
                <option value="pixel">Pixel Art</option>
                <option value="Cute cartoon style">Cartoon</option>
                <option value="Fantasy art style">Fantasy</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Story Settings</label>
          <textarea
            className="text-input settings-input"
            value={formData.storySettings}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                storySettings: e.target.value,
              }))
            }
            placeholder="Describe the setting (e.g., in a magical jungle, on a distant planet...)"
          />
        </div>

        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={!formData.storyText.trim() || isGenerating}
        >
          {isGenerating ? "Creating magic... ⌛" : "Generate Story ✨"}
        </button>
      </div>
    </div>
  );
};

export default Inputpage;
