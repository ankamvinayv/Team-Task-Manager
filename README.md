# Team Task Manager

A simple full-stack web application to manage projects and team tasks efficiently. The system allows admins to create projects, assign tasks, and manage members, while team members can update task progress and track assigned work. 

---

## 🚀 Features

* User Authentication (Login & Register)
* Role-Based Access (Admin & Member)
* Create and Manage Projects
* Create, Assign, and Update Tasks
* Dashboard with Task Statistics
* Responsive UI Design

---

## 🛠 Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router DOM

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

---

## 📂 Project Structure

```bash
client/     -> React Frontend
server/     -> Node.js Backend
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <your-repository-link>
cd team-task-manager
```

### Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside `server/`

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## ▶️ Run Project

### Backend

```bash
cd server
npm run dev
```

### Frontend

```bash
cd client
npm run dev
```

---

## 🌐 Deployment

* Frontend: Railway / Vercel
* Backend: Railway
* Database: MongoDB Atlas

---

## 👤 Roles

### Admin

* Manage projects
* Assign tasks
* Manage team members

### Member

* View assigned tasks
* Update task status

---

## 📌 Future Improvements

* File Uploads
* Notifications
* Real-Time Updates
* Team Chat

---

## 📄 License

This project is developed for academic and learning purposes.
