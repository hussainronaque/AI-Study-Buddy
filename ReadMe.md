# AI Study Buddy

An intelligent study planning application that helps students organize their academic schedules, create personalized study plans, and manage their learning journey with AI-powered assistance.

## 🚀 Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Schedule Management**: Upload and manage class schedules with image processing
- **AI-Powered Study Plans**: Generate personalized study plans using Python AI scripts
- **Notes Management**: Create, edit, and organize study notes
- **Todo Lists**: Track tasks and assignments
- **Smart Recommendations**: AI-driven study suggestions

## 🛠️ Tech Stack

**Backend**: Node.js, Express.js, MongoDB, Python (AI scripts)
**Frontend**: React.js, Axios, React Router
**Deployment**: Vercel, Docker support

## 📁 Project Structure

```
ai-study-buddy/
├── Backend/
│   ├── routes/           # API endpoints
│   ├── models/           # MongoDB schemas
│   ├── Input Schedule/   # Python AI scripts
│   └── uploads/          # File storage
└── Frontend/
    └── src/
        ├── components/   # React components
        ├── context/      # React context
        └── utils/        # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB database
- Python 3.7+
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ai-study-buddy
   
   # Backend
   cd Backend
   npm install
   pip install -r requirements.txt
   
   # Frontend
   cd ../Frontend
   npm install
   ```

2. **Environment Setup**
   
   Create `.env` in Backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET_KEY=your_jwt_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASSWORD=your_gmail_app_password
   ```

3. **Run the Application**
   ```bash
   # Backend (Terminal 1)
   cd Backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd Frontend
   npm start
   ```
