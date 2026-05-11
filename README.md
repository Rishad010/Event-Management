# Event Management System

A full-stack web application for managing events, registrations, and attendance with role-based access control.

## Features

- **JWT Authentication with Role-Based Access** — Secure user authentication with separate roles for students and administrators
- **Event Creation with Image Upload** — Create and manage events with banner images and rich details
- **QR Code-Based Attendance Tracking** — Scan QR codes to mark attendance at events
- **Event Capacity Management with Waitlist** — Set capacity limits and automatically waitlist users when events are full
- **Excel Export for Registrations** — Export all registration data to Excel format for reporting
- **Search and Filter with Pagination** — Search events by title/description, filter by upcoming/past, and paginated results

## Tech Stack

**Frontend:**
- React 19
- Material UI (MUI)

**Backend:**
- Node.js
- Express
- MongoDB
- Mongoose
- JWT

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Event-Management
   ```

2. **Install server dependencies**
   ```bash
   cd event-app/server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in `event-app/server/`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/event-management
   JWT_SECRET=your_jwt_secret_key_here
   ```

   Create a `.env` file in `event-app/client/`:
   ```env
   REACT_APP_API_BASE=http://localhost:5000/api
   ```

5. **Start the development servers**

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

6. **Access the application**

   Open your browser and navigate to `http://localhost:3000`

### Default Accounts

The application supports two user roles:
- **Student** — Can view events, register, and view their registrations
- **Admin** — Can create/edit/delete events, manage users, view attendance reports, and export data

## Screenshots

*Screenshots to be added here*

- Dashboard Overview
- Event List with Search and Filter
- Event Registration
- QR Code Scanner
- Admin Event Management
- User Management

## API Documentation

A Postman collection is included in the repository for testing all API endpoints. Import the collection to explore:

- Authentication endpoints (login, register)
- Event management (CRUD operations)
- Registration management
- Attendance tracking
- Excel export

---

Built with ❤️ using React, Node.js, and MongoDB
