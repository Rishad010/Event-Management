# 🎫 Event Management System

A robust, full-stack web application designed to streamline the organization of events, registrations, and attendance tracking.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)

[🌐 Live Demo](https://event-management-atlantis.vercel.app) and [⚙️ API](https://event-management-production-a5b2.up.railway.app)

## About

The Event Management System provides an all-in-one platform for educational institutions or organizations to host and manage events. It empowers administrators to effortlessly create events, track real-time attendance using QR codes, and generate exportable reports. Simultaneously, it offers a seamless experience for students to discover upcoming activities, securely register, and maintain a history of their participation.

## Features

| 🎓 Student Features | 🛠️ Admin Features |
| :--- | :--- |
| • **Browse Events**: View a catalog of upcoming and past events.<br>• **Seamless Registration**: Securely register for open events.<br>• **QR Code Ticket**: Receive a unique QR code upon successful registration.<br>• **Student Dashboard**: Track personal event history and upcoming registrations. | • **Event Management**: Create, edit, and delete events with rich details.<br>• **QR Scanner**: Scan student QR codes to mark attendance in real-time.<br>• **Data Export**: Export registration and attendance data directly to Excel.<br>• **User Management**: View and manage system users and permissions. |

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Material UI v7, React Router v6, Axios | Responsive user interface, component styling, client-side routing, and API communication. |
| **Backend** | Node.js, Express.js, JWT Authentication, Multer | Server-side logic, RESTful API routing, secure access control, and image upload handling. |
| **Database** | MongoDB, Mongoose ODM | Flexible NoSQL data storage and object data modeling. |
| **DevOps** | Vercel (frontend), Railway (backend), MongoDB Atlas | Cloud hosting and deployment platforms for highly available services. |

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rishad010/Event-Management.git
   cd Event-Management
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd event-app/server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in `event-app/server/`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/event-management
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

   Create a `.env` file in `event-app/client/`:
   ```env
   REACT_APP_API_BASE=http://localhost:5000/api
   ```

4. **Start the development servers**

   Start the backend server:
   ```bash
   cd event-app/server
   npm start
   ```

   In a new terminal, start the frontend:
   ```bash
   cd event-app/client
   npm start
   ```

   The application will be running at `http://localhost:3000`.

## Usage

The system operates strictly on role-based access to ensure security and proper delegation of capabilities.

| Role | Capabilities |
| :--- | :--- |
| **Student** | Can browse events, register for events, view their own dashboard, and generate QR codes for attendance. |
| **Admin** | Can access the admin dashboard, create/edit/delete events, scan QR codes, export data to Excel, and manage users. |

## API Documentation

A Postman collection is included in the repository for testing all API endpoints. Import the collection into Postman to explore. The API is structured into 4 main route groups:

- **Auth**: User authentication and authorization (Register, Login, Fetch Users).
- **Events**: CRUD operations for managing the event catalog.
- **Registrations**: Handling event sign-ups and attendance marking.
- **Users**: Admin operations for user account management.

## Project Structure

```text
Event-Management/
├── event-app/
│   ├── client/                 # React frontend application
│   │   ├── public/             # Static public assets
│   │   └── src/
│   │       ├── components/     # Reusable UI components
│   │       ├── context/        # React context (AuthContext)
│   │       ├── pages/          # Full page views (Dashboard, Events, etc.)
│   │       └── utils/          # Utility functions
│   └── server/                 # Node.js backend application
│       ├── controllers/        # Route logic and handlers
│       ├── middleware/         # Custom Express middleware (auth, upload)
│       ├── models/             # Mongoose database schemas
│       ├── routes/             # API route definitions
│       └── uploads/            # Local storage for uploaded images
├── PROJECT_OVERVIEW.md         # Detailed project specifications
└── README.md                   # This documentation file
```

## Screenshots

*Coming soon — see live demo*

- Dashboard Overview
- Event List with Search and Filter
- Event Registration
- QR Code Scanner
- Admin Event Management
- User Management

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ using the MERN Stack
