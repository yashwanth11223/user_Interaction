# Chat Application

A full-stack real-time chat application built using Next.js, Socket.IO, WebRTC, and MongoDB.
This application supports real-time messaging, voice notes, file sharing, and video/audio calling between users.

---

## 🚀 Features

* Real-time messaging using Socket.IO
* One-to-one chat system
* Voice message recording
* File and image sharing
* Audio and video calling (WebRTC)
* Persistent chat history using MongoDB
* User registration using phone number and name
* Dynamic user list with profile pictures
* Separate chat for each user

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Socket.IO

### Database

* MongoDB (Mongoose)

### Realtime & Media

* Socket.IO (real-time communication)
* WebRTC (simple-peer for calls)

---

## 📁 Project Structure

```
USERINT/
│
├── userinte/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js
│   │   │   │   ├── register/route.js
│   │   │   ├── messages/route.js
│   │   │   ├── socket/route.js
│   │   │   ├── upload/route.js
│   │   ├── layout.js
│   │   ├── page.js   ← Main Chat UI
│   │   ├── globals.css
│   │
│   ├── components/
│   │   ├── CallPopup.js
│   │   ├── Message.js
│   │   ├── VideoCall.js
│   │
│   ├── lib/
│   │   ├── db.js
│   │
│   ├── public/
│   ├── server/
│   │   ├── models/
│   │   │   ├── Message.js
│   │   │   ├── User.js
│   │   ├── server.js
│
├── .env.local
├── package.json
├── README.md
```

---

## 🗄️ Database (MongoDB)

The app uses MongoDB to store users and messages.

### Connection String

```
mongodb://127.0.0.1:27017/chatapp
```

### Collections

#### Users

* phone (unique)
* name
* photo (auto-generated avatar)

#### Messages

* conversationId
* from
* to
* type (message / voice / file)
* message / audio / file
* timestamps

---

## 🔐 Environment Variables (.env.local)

Create a file in root:

```
.env.local
```

Add the following:

```
MONGO_URI=mongodb://127.0.0.1:27017/chatapp
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_SOCKET_URL=http://127.0.0.1:4000
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/YOUR_USERNAME/chat-app.git
cd chat-app
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Start MongoDB

Make sure MongoDB is running locally.

---

### 4. Start Backend Server

```
cd server
node server.js
```

Backend runs on:

```
http://localhost:4000
```

---

### 5. Start Frontend

```
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### User APIs

* POST `/register` → Register new user
* GET `/users` → Get all users

### Message APIs

* GET `/messages/:user1/:user2` → Get chat history

---

## 🔄 Socket Events

* `join` → Register user socket
* `send-message` → Send message
* `receive-message` → Receive message
* `callUser` → Initiate call
* `incomingCall` → Receive call
* `answerCall` → Accept call
* `endCall` → End call

## 🔐 Environment Variables (.env.local)

This project uses a .env.local file to store environment-specific configuration such as database connection and backend URLs.

📁 File Location

Create the file in the root of your project:
```
.env.local
```
🧾 Required Variables

Add the following variables inside .env.local:
```
MONGO_URI=mongodb://127.0.0.1:27017/chatapp
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000
NEXT_PUBLIC_SOCKET_URL=http://127.0.0.1:4000
```
## 👨‍💻 Author

**Yashwanth**

---

## 📜 License

