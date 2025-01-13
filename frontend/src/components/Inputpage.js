import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Inputpage.css";

const Inputpage = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    storyText: "",
    storyLength: "short",
    storySettings: "",
    language: "en",
    age: "all",
    imageStyle: "realistic",
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
      console.log(data);
      // const data = {
      //   title: "The Mouse and the Curious Cat",
      //   story:
      //     "Prakash loved to play on the moon, where the gravity was weaker and he could jump higher than ever before. He would run and jump, feeling the moon's soft surface beneath his feet. The sky was bright, and the stars twinkled like diamonds all around him.\n\nOne day, Prakash met a curious cat named Whiskers, who was fascinated by the stars and the moon's craters. Whiskers asked Prakash, 'Can I see the stars up close?' Prakash replied, 'Of course, Whiskers! But we need to share them so everyone can see.' Prakash and Whiskers sat together, and Prakash showed Whiskers the beautiful stars.\n\nAs they sat together, Prakash realized that sharing was the best way to make friends. Whiskers was so happy to see the stars that she promised to share her favorite toys with Prakash. From that day on, Prakash and Whiskers became the best of friends, sharing and playing together on the moon. The end!",
      //   audio_url: "/media/output.mp3",
      //   total_time: 100.792,
      //   images: [
      //     {
      //       url: "https://tse3.mm.bing.net/th/id/OIG3.UxEOxHuPVC3X7bXvrw8l?pid=ImgGn",
      //       prompt:
      //         "Magical fairytale style: Prakash loved to play on the moon, where the gravity was weaker and he could jump higher than ever b",
      //     },
      //     {
      //       url: "https://tse2.mm.bing.net/th/id/OIG4.tpBjgJmj8z4ht79M83f4?pid=ImgGn",
      //       prompt:
      //         "Magical fairytale style: efore. He would run and jump, feeling the moon's soft surface beneath his feet. The sky was bright, ",
      //     },
      //     {
      //       url: null,
      //       prompt: null,
      //     },
      //     {
      //       url: null,
      //       prompt: null,
      //     },
      //     {
      //       url: null,
      //       prompt: null,
      //     },
      //   ],
      // };
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
        <div className="textarea-wrapper">
          <textarea
            className="story-text-input"
            value={formData.storyText}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, storyText: e.target.value }))
            }
            placeholder="Write your imagination here..."
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

      <div className="button-group">
        <button
          className={`settings-button ${showSettings ? "active" : ""}`}
          onClick={() => setShowSettings(!showSettings)}
        >
          Story Settings ⚙️
        </button>
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={!formData.storyText.trim() || isGenerating}
        >
          {isGenerating ? "Creating magic... ⌛" : "Generate Story ✨"}
        </button>
      </div>

      {isGenerating && (
        <div className="loading-overlay">
          <img
            src="loading.gif" // Replace with your preferred loading GIF
            alt="Loading..."
            className="loading-gif"
          />
          <p>Generating your story... ✨</p>
        </div>
      )}

      {showSettings && (
        <div className="settings-section">
          <div className="select-row">
            <div className="select-group">
              <label className="select-label">Language</label>
              <div className="select-wrapper">
                <select
                  className="select-dropdown"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
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
            <label className="input-label">Story Environment</label>
            <textarea
              className="story-text-input settings-input"
              value={formData.storySettings}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  storySettings: e.target.value,
                }))
              }
              placeholder="(e.g., in a magical jungle, on a distant planet...)"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inputpage;
