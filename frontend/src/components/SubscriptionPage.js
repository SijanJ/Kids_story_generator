import React, { useState, useEffect } from "react";
import "./subscription.css";

// Function to generate a random captcha
const generateCaptcha = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let captcha = '';
  for (let i = 0; i < 4; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};

const SubscriptionPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Show the confirmation modal
  const [captcha, setCaptcha] = useState(generateCaptcha()); // Generate random captcha
  const [userCaptcha, setUserCaptcha] = useState(""); // User input captcha
  const [errorMessage, setErrorMessage] = useState("");
  const [otp, setOtp] = useState("6969"); // OTP state
  const [userOtp, setUserOtp] = useState(""); // User input OTP
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [esewaId, setEsewaId] = useState(""); // eSewa ID
  const [password, setPassword] = useState(""); // Password/MPIN
  const [isValidEsewaId, setIsValidEsewaId] = useState(true); // Validate eSewa ID
  const [isOtpValid, setIsOtpValid] = useState(false); // OTP valid state
  const [selectedPlan, setSelectedPlan] = useState(null); // Track the selected plan
  const [subscribedPlans, setSubscribedPlans] = useState([]); // Track already subscribed plans

  // Add state variables for username, email, and mpin
  const [username, setUsername] = useState(""); // State for username
  const [email, setEmail] = useState(""); // State for email
  const [mpin, setMpin] = useState(""); // State for mpin

  // Load the subscribed plans from localStorage on page load
  useEffect(() => {
    const storedPlan = localStorage.getItem("subscribedPlan");
    if (storedPlan) {
      setSubscribedPlans([parseInt(storedPlan)]);
    }
  }, []);

  const plans = [
    { id: 1, name: "Unlimited Audio ", price: "Rs. 2000" },
    { id: 2, name: "Unlimited Audio Visuals", price: "Rs. 3000" },
    { id: 3, name: "Games", price: "Rs. 2000" },
  ];

  const handlePlanClick = (plan) => {
    // Check if the plan has already been subscribed
    if (subscribedPlans.includes(plan.id)) {
      alert("You have already subscribed to this plan.");
      return;
    }

    // Reset form fields and errors when a new plan is selected
    setSelectedPlan(plan);
    setEsewaId("");
    setPassword("");
    setUserCaptcha("");
    setUserOtp("");
    setErrorMessage("");
    setIsOtpVisible(false);
    setIsOtpValid(false);
    setShowModal(true);
    setCaptcha(generateCaptcha()); // Reset captcha
  };

  const closeModal = () => {
    setShowModal(false);
    setShowConfirmationModal(false); // Hide the confirmation modal
    setIsOtpVisible(false); // Reset OTP visibility
    setErrorMessage(""); // Clear error message
    setUserOtp(""); // Clear OTP input
  };

  const handleCaptchaChange = (e) => {
    setUserCaptcha(e.target.value);
  };

  const handleOtpChange = (e) => {
    setUserOtp(e.target.value);
  };

  const handleEsewaIdChange = (e) => {
    const value = e.target.value;
    setEsewaId(value);

    // Validate if eSewa ID is 10 digits long and contains only numbers
    const isValid = /^\d{10}$/.test(value);
    setIsValidEsewaId(isValid);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value); // Update username
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value); // Update email
  };

  const handleMpinChange = (e) => {
    setMpin(e.target.value); // Update mpin
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate eSewa ID and password
    if (!isValidEsewaId) {
      setErrorMessage("eSewa ID must be exactly 10 digits.");
      return;
    }

    // Validate captcha
    if (userCaptcha !== captcha) {
      setErrorMessage("Captcha is incorrect. Please try again.");
      return;
    }

    // If validation passes, show OTP section
    setIsOtpVisible(true);
    setErrorMessage(""); // Clear error message after successful validation
  };

  const handleSubscribe = () => {
    // Check if eSewa ID, Password/MPIN, and OTP are empty
    if (!esewaId || !password || !userCaptcha) {
      setErrorMessage("Please fill all fields (eSewa ID, Password, Captcha).");
      return;
    }

    if (userCaptcha !== captcha) {
      setErrorMessage("Captcha is incorrect. Please try again.");
      return;
    }

    setIsOtpVisible(true);
    // Validate OTP only after it is filled
    if(userOtp=="")
    {
      setErrorMessage("Please enter your OTP.");
      return;
    }
    if (userOtp !== otp) {
      setErrorMessage("OTP is incorrect. Please try again.");
      setIsOtpValid(false);
      return;
    }
    setErrorMessage("Confirm Payment");

    // If OTP is correct, mark the plan as subscribed and show confirmation form
    setIsOtpValid(true);
    setShowModal(false); // Hide the current modal
    setShowConfirmationModal(true); // Show confirmation modal

    // Store the selected plan ID in localStorage
    localStorage.setItem("subscribedPlan", selectedPlan.id);
  };

  // Handle confirmation modal submission
  const handleConfirmSubscription = () => {
    if (!username || !email || !mpin) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    setShowConfirmationModal(false); // Close the confirmation modal after successful subscription
    alert(`Subscription Successful!\nPlan: ${selectedPlan.name}\nPrice: ${selectedPlan.price}`);
    setSubscribedPlans([...subscribedPlans, selectedPlan.id]);
  };

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Select a plan and get started with the best subscription!</p>
        {/* Display subscribed plan as badge */}
        {subscribedPlans.length > 0 && (
          <div className="badge">
            Subscribed Plan: {plans.find(plan => plan.id === subscribedPlans[0]).name}
          </div>
        )}
      </div>

      <div className="subscription-plans">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`subscription-plan ${subscribedPlans.includes(plan.id) ? 'disabled' : ''} plan-${plan.id}`}
            onClick={() => handlePlanClick(plan)}
          >
            <p>{plan.name}</p>
            <div className="price">{plan.price}</div>
          </div>
        ))}
      </div>

      {/* Subscription Modal */}
      {showModal && (
        <div className="login-modal">
          <div className="login-form">
            <div className="close-btn" onClick={closeModal}>X</div>
            <h2>Login to Subscribe</h2>

            {selectedPlan && (
              <div className="plan-price">
                <p><strong>Price: {selectedPlan.price}</strong></p>
              </div>
            )}

            <div className="login-field">
              <label className="login-label">eSewa ID</label>
              <input
                className="login-input"
                type="text"
                placeholder="Enter eSewa ID"
                value={esewaId}
                onChange={handleEsewaIdChange}
                maxLength={10}
              />
              {!isValidEsewaId && (
                <div className="error-message">eSewa ID must be exactly 10 digits.</div>
              )}
            </div>

            <div className="login-field">
              <label className="login-label">Password/MPIN</label>
              <input
                className="login-input"
                type="password"
                placeholder="Enter MPIN"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="login-field">
              <label className="login-label">Captcha</label>
              <input
                className="login-input"
                type="text"
                placeholder="Enter Captcha"
                value={userCaptcha}
                onChange={handleCaptchaChange}
              />
              <div className="captcha">{captcha}</div>
            </div>

            {isOtpVisible && (
              <div className="login-field">
                <label className="login-label">OTP</label>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Enter OTP"
                  value={userOtp}
                  onChange={handleOtpChange}
                />
              </div>
            )}

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            {!isOtpVisible ? (
              <button className="login-button" onClick={handleSubmit}>
                Proceed to OTP
              </button>
            ) : (
              <button className="login-button" onClick={handleSubscribe}>
                Confirm Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="confirmation-modal">
          <div className="confirmation-form">
            <div className="close-btn" onClick={closeModal}>X</div>
            <h2>Confirm Subscription</h2>

            <div className="login-field">
              <label className="login-label">Username</label>
              <input
                className="confirmation-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>

            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="confirmation-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>

            <div className="login-field">
              <label className="login-label">MPIN</label>
              <input
                className="confirmation-input"
                type="password"
                placeholder="Enter your MPIN"
                value={mpin}
                onChange={handleMpinChange}
              />
            </div>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            <button className="close-modal-btn" onClick={handleConfirmSubscription}>
              Confirm and Subscribe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
