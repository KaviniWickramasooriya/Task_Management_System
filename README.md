# 📋 Task Management WebApp – Gamage Recruiters SE Internship Project

A full-stack **Task Management System** built as part of the Gamage Recruiters Software Engineering Internship (June, Week 1). This project evaluates a candidate's ability to rapidly prototype and deliver a secure, well-structured MERN application with modern UI/UX and feature-rich functionalities under a 24-hour challenge.

---

## 🚀 Features

### 🔐 Authentication
- Google OAuth 2.0 Login
- Manual Email/Password Login
- Gmail OTP Code Verification
- Route protection with JWT middleware

### ✅ Task Management
- CRUD operations: Create, Read, Update, Delete
- Fields: Title, Description, Deadline, Assigned To, Status
- Search, sort, and filter tasks
- Generate PDF reports of tasks (via jsPDF or pdfkit)

### 👥 User Management
- View all users
- Edit user profile data (name, email, role)
- Terminate/Deactivate users (soft delete)

### 🎨 UI/UX
- Fully responsive with **Tailwind CSS** and **Bootstrap**
- Essential pages: Login, Register, Dashboard, Task List, User Profile, Admin Panel

---

## 🧱 Tech Stack

| Layer      | Technology                             |
|------------|----------------------------------------|
| Frontend   | React, Tailwind CSS, Bootstrap         |
| Backend    | Node.js, Express.js                    |
| Database   | MongoDB (Mongoose ODM)                 |
| Auth       | Google OAuth 2.0, JWT, Gmail OTP       |
| PDF Export | jsPDF / pdfkit                         |
| Email OTP  | Nodemailer                             |
| DevOps     | Git, GitHub                            |

---

## 🔧 Backend Setup

cd backend
npm install
cp ../env_files/.env.backend .env
npm start


## 🖥️  Backend Setup

cd ../frontend
npm install
cp ../env_files/.env.frontend .env
npm run dev
