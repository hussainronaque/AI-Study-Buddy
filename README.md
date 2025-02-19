# AI Study Buddy

## Project Overview
The AI Study Buddy is a web application designed to help students manage their study schedules by creating customized plans based on their availability and deadlines. The system provides study recommendations, tracks progress, and sends notifications to ensure productivity.

## Features
- **AI-Generated Study Plans**: The system generates study plans based on user input, including class schedules, deadlines, and extracurricular activities.
- **Progress Tracking**: Users can mark completed tasks and receive feedback on their study patterns.
- **Calendar Integration**: Sync schedules with Google Calendar or Microsoft Calendar.
- **Notifications**: Receive reminders for upcoming study sessions and deadlines.

---

## Getting Started

### Prerequisites
- **Docker** installed on your machine.
  - [Download Docker for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - [Download Docker for Windows](https://docs.docker.com/desktop/install/windows-install/)
- **Git** installed (for cloning the repository).
  - [Download Git for Mac](https://git-scm.com/download/mac)
  - [Download Git for Windows](https://git-scm.com/download/win)

---

### Installation

1. **Clone the Repository**:
   Open your terminal (Mac) or command prompt (Windows) and run:
   ```bash
   git clone https://github.com/hussainronaque/AI-Study-Buddy.git
   
2. Navigate to the project directory:
   ```bash
   cd AI-Study-Buddy
   ```
   
4. Build and Run the Docker Container:
   For Mac and Windows:
   ```bash
   docker-compose up --build
   ```
   
   This will start the application in a Docker container.
   
6. Running the Application
   Once the Docker container is running, open your browser and navigate to:
   ```bash
   http://localhost:3000
   ```

7. Stopping the Application
   To stop the Docker container, press Ctrl + C in the terminal or command prompt where the container is running.
   
   To remove the container, run:
   ```bash
   docker-compose down
   ```

   
   
