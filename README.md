# Task Management Application

## Description

A simple task management app that allows users to add, edit, delete, and reorder tasks. Tasks are categorized into three sections: **To-Do**, **In Progress**, and **Done**. The app features a drag-and-drop interface for task reordering, and changes are saved instantly to the database for persistence. The app is fully responsive, providing a clean, minimalistic UI for both desktop and mobile users.

## Live Links

- **[Live Demo](#)**


## Dependencies

- **Frontend:**
  - React (for UI components)
  - React-DnD (for drag-and-drop functionality)
  - Axios (for HTTP requests)
  - Tailwind CSS (for responsive design)
  - React Router (for routing)
  
- **Backend:**
  - Node.js (for server-side logic)
  - Express (for creating APIs)
  - MongoDB (for database storage)
  
- **Others:**
  - dotenv (for environment variable management)

## Installation Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/NajibHossain49/Job-Task-Assignment.git
   cd Job-Task-Assignment
   ```

2. **Install Backend Dependencies**

   Navigate to the backend folder and install dependencies:
   
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   Navigate to the frontend folder and install dependencies:
   
   ```bash
   cd frontend
   npm install
   ```

4. **Set up Environment Variables**

   - Create a `.env` & `.env.local` file in the root of the backend & frontend folder and add necessary environment variables (e.g., database connection string).

   Example:
   ```.env
   
DB_USER=<Add your DB_USER>
SECRET_KEY=<Add your SECRET_KEY>
   ```
```.env.local
VITE_FIREBASE_API_KEY=<Add your Firebase Credential>
VITE_FIREBASE_AUTH_DOMAIN=<Add your Firebase Credential>
VITE_FIREBASE_PROJECT_ID=<Add your Firebase Credential>
VITE_FIREBASE_STORAGE_BUCKET=<Add your Firebase Credential>
VITE_FIREBASE_MESSAGING_SENDER_ID=<Add your Firebase Credential>
VITE_FIREBASE_APP_ID=<Add your Firebase Credential>

For development
VITE_API_URL=http://localhost:5000

```

5. **Run the Application**

   - For the backend:
     ```bash
     cd backend
     npm start
     ```

   - For the frontend:
     ```bash
     cd frontend
     npm start
     ```

6. The app should now be running locally. Visit `http://localhost:3000` in your browser.

## Technologies Used

- **Frontend:**
  - React
  - Tailwind CSS
  - Axios
  - React Router
  

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  

- **Others:**
  - dotenv

