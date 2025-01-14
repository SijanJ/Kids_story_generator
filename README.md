# Kids Story Generator

Welcome to the **Kids Story Generator**! This project, developed for the **Hack-a-Week 2025** event, aims to create fun, engaging, and personalized bedtime stories for children based on simple prompts provided by users.

## Overview

The **Kids Story Generator** allows users to input prompts (e.g., a character, object, or theme) to generate customized, delightful stories for children. It leverages modern web technologies to ensure an interactive and enjoyable experience for both kids and parents.

### Key Features

- **Personalized Stories**: Create unique stories based on your child's favorite themes or characters.
- **Engaging Plotlines**: Fun and educational content designed to stimulate creativity.
- **Kid-Friendly Interface**: Simple and intuitive navigation for young users.
- **Responsive Design**: Fully optimized for mobile and desktop devices.

---

## Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Python - Django (if working with the backend)

### Clone the Repository

```bash
git clone git@github.com:SijanJ/Kids_story_generator.git
cd kids-story-generator
```

### Install Dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
pip install -r requirements.txt

# Download required data
cd backend/story_backend
python download.py
```

### Running the App

#### Start the Frontend

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

#### Start the Backend

```bash
python manage.py runserver 8080
```

### Build for Production

When ready to deploy, build the app for production:

```bash
npm run build
```

The optimized app will be available in the `build` folder.

---

## Available Scripts

Within the project directory, you can execute the following scripts:

### `npm start`

Runs the app in development mode. The app will be available at [http://localhost:3000](http://localhost:3000). Any changes you make will reload automatically, and lint errors will appear in the console.

### `npm test`

Launches the test runner in interactive watch mode. Refer to the [Create React App Testing Documentation](https://facebook.github.io/create-react-app/docs/running-tests) for details.

### `npm run build`

Builds the app for production. It optimizes the app for better performance and creates a minified version in the `build` folder.

### `npm run eject`

**Note**: Ejecting is a one-way operation. It provides full control over the build configuration but cannot be undone. Use it only if necessary.

---

## Learn More

Explore more about **React** and **Create React App** using the following resources:

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

Additional Topics:

- [Code Splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
- [Analyzing the Bundle Size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
- [Making a Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
- [Deployment](https://facebook.github.io/create-react-app/docs/deployment)

---

## Contributing

We welcome contributions to the **Kids Story Generator**! If you have ideas for improvement, feel free to open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Notes

This project requires an OpenAI API key for certain features. Alternatively, you can use **gTTS** (Google Text-to-Speech) for free. Bing image authentication cookies are needed to generate images.

---

## Demo

Short demo video showcasing the application is available: 

https://github.com/user-attachments/assets/d585a2b8-a5c5-4526-8aeb-75681476ede9

