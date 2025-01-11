// components/AboutPage.jsx
import React, { useState } from "react";
import "./AboutPage.css";

const AboutPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [otherInput, setOtherInput] = useState("");

  const steps = [
    {
      question: "Your favorite toy? 🧸",
      subtitle: "Pick what makes you smile! 🎈",
      options: [
        { label: "Building blocks", subtext: "LEGO or Mega Bloks" },
        {
          label: "Action figures or dolls",
          subtext: "Superheroes, or baby dolls",
        },
        { label: "Remote-controlled cars", subtext: "or other vehicles" },
        { label: "Stuffed animals", subtext: "or plush toys" },
        { label: "Games or puzzles", subtext: "Ludo, Jenga" },
        { label: "Art and craft supplies", subtext: "crayons, Play-Doh" },
      ],
    },
    {
      question: "Your favorite person? 👶",
      subtitle: "Pick what makes you smile! 🎈",
      options: [
        { label: "Mom", subtext: "", emoji: "❤️" },
        { label: "Dad", subtext: "", emoji: "💙" },
        { label: "Best Friend", subtext: "", emoji: "🤝" },
        { label: "Teacher", subtext: "", emoji: "📚" },
        { label: "Sibling", subtext: "Brother or Sister", emoji: "👫" },
        {
          label: "Grandparent",
          subtext: "Grandmother, Grandfather",
          emoji: "👴👵",
        },
      ],
    },
    {
      question: "A special animal? 🫏",
      subtitle: "Pick what makes you smile! 🎈",
      options: [
        { label: "Dog", subtext: "", emoji: "🐶" },
        { label: "Cat", subtext: "", emoji: "🐈" },
        { label: "Dinosaur", subtext: "", emoji: "🦖" },
        { label: "Tiger", subtext: "", emoji: "🐯" },
        { label: "Rabbit", subtext: "", emoji: "🐇" },
        {
          label: "Other?",
          subtext: "",
          emoji: "",
        },
      ],
    },
  ];

  const handleOptionSelect = (option) => {
    // Handle selection and move to next step if available
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  const handleOtherInputSubmit = () => {
    // Handle input from the "Other" field and move to the next step
    if (otherInput.trim() !== "") {
      if (currentStep < steps.length - 1) {
        setOtherInput(""); // Clear input for next step
        setCurrentStep(currentStep + 1);
      }
    }
  };

  return (
    <div className="about-page">
      <h1>Choose Your Adventure!</h1>
      <p className="subtitle">{steps[currentStep].subtitle}</p>

      <div className="question-container">
        <h2 className="question">{steps[currentStep].question}</h2>

        <div className="options-grid">
          {steps[currentStep].options.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => handleOptionSelect(option)}
            >
              <span className="option-label">
                {option.label} {option.emoji}
              </span>
              {option.subtext && (
                <span className="option-subtext">{option.subtext}</span>
              )}
            </button>
          ))}
          <div className="other-input-container">
            <input
              type="text"
              placeholder="Type your answer..."
              value={otherInput}
              onChange={(e) => setOtherInput(e.target.value)}
              className="other-input"
            />
            <button
              className="submit-other-button"
              onClick={handleOtherInputSubmit}
              disabled={otherInput.trim() === ""}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {currentStep === 0 && (
        <div className="mascot">
          <img src="" alt="Teddy bear mascot" />
        </div>
      )}
    </div>
  );
};

export default AboutPage;
