import React, { useState } from "react";
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

  // New fields for confirmation modal
  const [username, setUsername] = useState(""); // Store the user's username
  const [email, setEmail] = useState(""); // Store the user's email
  const [mpin, setMpin] = useState(""); // Store MPIN (Password)
  const [isValidEmail, setIsValidEmail] = useState(true); // For email validation
  
  const plans = [
    { id: 1, name: "Plan 1", price: "$99.99" },
    { id: 2, name: "Plan 2", price: "$149.99" },
    { id: 3, name: "Plan 3", price: "$199.99" },
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
    if (userOtp !== otp) {
      setErrorMessage("OTP is incorrect. Please try again.");
      setIsOtpValid(false);
      return;
    }

    // If OTP is correct, mark the plan as subscribed and show confirmation form
    setSubscribedPlans([...subscribedPlans, selectedPlan.id]);
    setIsOtpValid(true);
    setShowModal(false); // Hide the current modal
    setShowConfirmationModal(true); // Show confirmation modal
  };

  // Handle confirmation modal submission
  const handleConfirmSubscription = () => {
    if (!username || !email || !mpin) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    setShowConfirmationModal(false); // Close the confirmation modal after successful subscription
    alert(`Subscription Successful!\nPlan: ${selectedPlan.name}\nPrice: ${selectedPlan.price}`);
  };

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Select a plan and get started with the best subscription!</p>
      </div>

      <div className="subscription-plans">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`subscription-plan ${subscribedPlans.includes(plan.id) ? 'disabled' : ''}`}
            onClick={() => handlePlanClick(plan)}
          >
            <img src={`plan${plan.id}.jpg`} alt={plan.name} />
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
                placeholder="Enter Password/MPIN"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="captcha-container">
              <label className="captcha-text">Enter Captcha: {captcha}</label>
              <input
                className="captcha-input"
                type="text"
                value={userCaptcha}
                onChange={handleCaptchaChange}
                placeholder="Captcha"
              />
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {isOtpVisible && (
              <div className="otp-container">
                <label className="otp-text">Enter OTP</label>
                <input
                  className="otp-input"
                  type="text"
                  value={userOtp}
                  onChange={handleOtpChange}
                  placeholder="Enter OTP"
                />
              </div>
            )}

            <button className="login-button" onClick={handleSubscribe}>
              Subscribe Now
            </button>

            <button className="close-modal-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="confirmation-modal">
          <div className="confirmation-form">
            <h2>Confirm Your Subscription</h2>

            <div className="login-field">
              <label className="login-label">Username</label>
              <input
                className="login-input"
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label className="login-label">MPIN</label>
              <input
                className="login-input"
                type="password"
                placeholder="Enter MPIN"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
              />
            </div>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <button className="login-button" onClick={handleConfirmSubscription}>
              Confirm Subscription
            </button>
            
            <button className="close-modal-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
