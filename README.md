# Task Management Application

## Description

A simple task management app that allows users to add, edit, delete, and reorder tasks. Tasks are categorized into three sections: **To-Do**, **In Progress**, and **Done**. The app features a drag-and-drop interface for task reordering, and changes are saved instantly to the database for persistence. The app is fully responsive, providing a clean, minimalistic UI for both desktop and mobile users.

## Live Links

- **[Live Demo](https://task-management-application-49.web.app)**


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

## 4. **Set up Environment Variables**

### Backend:

1. **Create a `.env` file** in the root of the **backend** folder and add the following environment variables:

   Example:
   ```env
   DB_USER=<Add your DB_USER>
   SECRET_KEY=<Add your SECRET_KEY>
   ```
   

   Replace `<Add your ...>` with your actual database credentials and secret key values.

### Frontend:

2. **Create a `.env.local` file** in the root of the **frontend** folder and add the following environment variables for Firebase credentials and local development configuration:

   Example:
   ```env
   VITE_FIREBASE_API_KEY=<Add your Firebase API key>
   VITE_FIREBASE_AUTH_DOMAIN=<Add your Firebase Auth domain>
   VITE_FIREBASE_PROJECT_ID=<Add your Firebase project ID>
   VITE_FIREBASE_STORAGE_BUCKET=<Add your Firebase storage bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<Add your Firebase messaging sender ID>
   VITE_FIREBASE_APP_ID=<Add your Firebase app ID>

   # For local development
   VITE_API_URL=http://localhost:5000
   ```

   Replace `<Add your ...>` with your actual Firebase credentials and local API URL.

> **Important:** Make sure to add `.env.local` to your `.gitignore` to prevent it from being committed to version control.

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

6. The app should now be running locally. Visit `http://localhost:5173` in your browser.

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

---

## 🧑‍💻 Author

Developed with ❤️ by **Najib Hossain**  
[GitHub](https://github.com/NajibHossain49) | [LinkedIn](https://www.linkedin.com/in/md-najib-hossain)

## 🌟 Show Your Support

If you like this project, please ⭐ the repository and share it with others!