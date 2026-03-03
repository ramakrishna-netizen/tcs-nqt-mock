
# TCS NQT Mock Test Clone

A full-stack mock application replicating the TCS National Qualifier Test environment.
This project includes a React/Vite frontend and a Python (Flask) backend and is intended for local development,
demo purposes and learning how to connect a client to a server.

## 📁 Project Structure

```
├─ backend/        # Flask server
│  ├─ app.py        # main API entry point
│  └─ requirements.txt
├─ public/         # Static frontend assets
└─ src/            # React components and styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Python 3.10+
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramakrishna-netizen/tcs-nqt-mock.git
   cd tcs-nqt-mock
   ```

2. **Backend**
   ```bash
   cd backend
   python -m venv venv
   # activate the environment
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   # source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   ```
   The API will run at `http://localhost:5000` by default.

3. **Frontend**
   ```bash
   cd ../
   npm install
   npm run dev
   ```
   Open the browser at the URL printed by Vite (typically `http://localhost:5173`).

## 🧰 Available Scripts

- `npm run dev` – start the frontend in development mode with hot reloading.
- `npm run build` – bundle the frontend for production.
- `python app.py` – launch the Flask backend.

## 📝 Notes

- Environment variables (e.g. API URL) can be configured using a `.env` file or shell exports.
- Update `.gitignore` if additional directories/files should be excluded from version control.

