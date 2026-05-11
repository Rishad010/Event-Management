# Project Overview: Event Management System

## Project Summary

The Event Management System is a full-stack web application for managing events, registrations, and attendance tracking. The app supports two user roles:

- **Students**: Can browse events, register for events, view their registrations, and display QR codes for attendance marking
- **Admins**: Can create/edit/delete events, view all registrations, manage users, scan QR codes to mark attendance, and view attendance analytics

The system features QR code-based attendance tracking where students receive a unique QR code upon registration, and admins can scan these codes to mark attendance at the event venue.

---

## Tech Stack

### Frontend (React)
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.0 | Core React library |
| react-dom | ^19.1.0 | React DOM renderer |
| react-router-dom | ^6.22.3 | Client-side routing |
| @mui/material | ^7.1.2 | Material-UI components |
| @mui/icons-material | ^7.1.2 | Material-UI icons |
| @mui/lab | ^7.0.0-beta.14 | Material-UI lab components |
| @emotion/react | ^11.14.0 | CSS-in-JS styling |
| @emotion/styled | ^11.14.0 | Styled components |
| axios | ^1.10.0 | HTTP client |
| jwt-decode | ^4.0.0 | JWT token decoding |
| qrcode.react | ^4.2.0 | QR code generation |
| html5-qrcode | ^2.3.8 | QR code scanning |
| react-scripts | 5.0.1 | CRA build tools |

### Backend (Node.js/Express)
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.19.2 | Web framework |
| mongoose | ^8.4.1 | MongoDB ODM |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| cors | ^2.8.5 | Cross-origin requests |
| dotenv | ^16.4.5 | Environment variables |
| multer | ^1.4.5-lts.1 | File upload handling |
| qrcode | ^1.5.3 | QR code generation |
| exceljs | ^4.4.0 | Excel export (unused) |
| socket.io | ^4.7.5 | Real-time features (unused) |
| nodemon | ^3.1.0 | Dev server (dev dependency) |

---

## Folder Structure

```
c:\Users\user\OneDrive\Documents\Event Management\Project/
├── PROJECT_OVERVIEW.md          # This documentation file
├── package.json                 # Root dependencies (minimal)
├── package-lock.json
├── Event Management API.postman_collection.json  # API documentation
│
├── event-app/
│   ├── client/                  # React frontend
│   │   ├── package.json
│   │   ├── public/              # Static assets
│   │   ├── src/
│   │   │   ├── App.js           # Main app component with routes
│   │   │   ├── index.js         # Entry point
│   │   │   ├── theme.js         # MUI custom theme
│   │   │   ├── App.css          # Global styles
│   │   │   ├── index.css
│   │   │   ├── pages/           # Page components
│   │   │   │   ├── Login.js
│   │   │   │   ├── Register.js
│   │   │   │   ├── Events.js
│   │   │   │   ├── Dashboard.js          # Admin dashboard
│   │   │   │   ├── StudentDashboard.js
│   │   │   │   ├── EventRegistrations.js
│   │   │   │   └── UserManagement.js
│   │   │   ├── components/      # Reusable components
│   │   │   │   ├── Navbar.js
│   │   │   │   ├── Hero.js
│   │   │   │   ├── QRScanner.js
│   │   │   │   ├── PrivateRoute.js
│   │   │   │   └── PublicRoute.js
│   │   │   ├── context/         # React contexts
│   │   │   │   └── AuthContext.js
│   │   │   └── utils/           # Utility functions
│   │   │       └── imageUtils.js
│   │
│   └── server/                  # Express backend
│       ├── package.json
│       ├── app.js               # Express app entry
│       ├── .env                 # Environment variables
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── eventRoutes.js
│       │   └── registrationRoutes.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── eventController.js
│       │   └── registrationController.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Event.js
│       │   └── Registration.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── uploadMiddleware.js
│       └── uploads/             # Uploaded event images
```

---

## Features Implemented

### Authentication & Authorization
- User registration with role selection (student/admin)
- Login with JWT token authentication
- Protected routes based on authentication status
- Role-based access control (admin-only routes)
- Password hashing with bcrypt

### Event Management (Admin)
- Create events with title, description, location, date, and image
- Edit existing events
- Delete events
- View all events with statistics
- Image upload support

### Event Registration (Student)
- Browse all upcoming events
- Register for events (prevents duplicate registrations)
- Receive unique QR code upon registration
- View registered events on personal dashboard

### Attendance Tracking
- QR code generation for each registration
- QR code scanning interface for admins
- Real-time attendance marking
- Attendance analytics and reporting

### Admin Dashboard
- Event statistics (total events, registrations, attendance rate)
- Event summary table with registration counts
- Quick action links (scan QR, create event, manage users)
- Recent events list with edit/delete options

### User Management (Admin)
- View all users with role indicators
- Edit user details (name, email, role)
- Delete users
- Statistics cards (total users, admins, students)

### UI/UX Features
- Responsive Material-UI design
- Gradient background theme
- Loading skeletons
- Snackbar notifications
- Hero section on events page
- Navigation with scroll-aware transparency

---

## API Routes

### Authentication Routes (`/api/auth`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/register` | Public | Register new user (student or admin) |
| POST | `/login` | Public | Login and receive JWT token |
| GET | `/users` | Admin only | Get all users |
| PUT | `/users/:id` | Admin only | Update user by ID |
| DELETE | `/users/:id` | Admin only | Delete user by ID |

### Event Routes (`/api/events`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/` | Public | Get all events (sorted by date) |
| GET | `/:id` | Public | Get single event by ID |
| POST | `/` | Admin only | Create new event (with image upload) |
| PUT | `/:id` | Admin only | Update event (with image upload) |
| DELETE | `/:id` | Admin only | Delete event |

### Registration Routes (`/api/registrations`)
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/:eventId/register` | Student | Register for an event |
| GET | `/my-registrations` | Student | Get current user's registrations |
| POST | `/mark-attendance` | Admin only | Mark attendance via QR scan |
| GET | `/event/:eventId` | Admin only | Get all registrations for an event |
| GET | `/summary` | Admin only | Get attendance summary for all events |

---

## Database Models

### User Model (`/server/models/User.js`)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | User's full name |
| email | String | Yes | Unique email address |
| password | String | Yes | Hashed password |
| role | String | No | 'student' or 'admin' (default: 'student') |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

**Methods:**
- `comparePassword(enteredPassword)` - Compares hashed passwords

### Event Model (`/server/models/Event.js`)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | Yes | Event title |
| description | String | No | Event description |
| location | String | No | Event location |
| date | Date | Yes | Event date/time |
| image | String | No | Image URL or filename |
| createdBy | ObjectId | No | Reference to User who created event |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### Registration Model (`/server/models/Registration.js`)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user | ObjectId | Yes | Reference to registered User |
| event | ObjectId | Yes | Reference to Event |
| qrCode | String | No | Base64 QR code image |
| attendance | Boolean | No | Attendance status (default: false) |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

**Indexes:**
- Unique compound index on `[user, event]` to prevent duplicate registrations

---

## Authentication

The application uses **JWT (JSON Web Token)** based authentication:

### Flow:
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server validates credentials and returns a JWT token + user object
3. Client stores token in `localStorage`
4. Client includes token in Authorization header for protected requests: `Authorization: Bearer <token>`
5. Server middleware (`protect`) verifies token and attaches user to request
6. Additional middleware (`adminOnly`) checks role for admin-only routes

### Token Details:
- **Algorithm**: HS256
- **Expiry**: 7 days
- **Payload**: `{ id: user._id, role: user.role }`
- **Storage**: localStorage (token + user object)

### Middleware Functions:
| Middleware | Purpose |
|------------|---------|
| `protect` | Verifies JWT token and attaches user |
| `adminOnly` | Ensures user has 'admin' role |

---

## Known Issues / Incomplete Features

### Minor Issues
1. **Socket.io unused** - The package is installed but not implemented for real-time features
2. **Excel export unused** - `exceljs` is installed but not used for data export
3. **Settings page placeholder** - The Settings quick action in admin dashboard is non-functional

### Code Observations
1. **multer version mismatch** - Root package.json has `multer@^2.0.1` but server uses `multer@^1.4.5-lts.1`
2. **react-router-dom versions** - Root has v5.3.4 but client uses v6.22.3 (potential conflict)

### Potential Improvements
1. No password reset functionality
2. No email verification
3. No pagination for events/users lists
4. No search/filter functionality for events
5. No event categories or tags
6. No waiting list functionality for full events
7. No notification system for event reminders

---

## Frontend Pages/Components

### Pages (`/client/src/pages/`)

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| **Login** | `/login` | Public | User login form with email/password |
| **Register** | `/register` | Public | User registration with role selection |
| **Events** | `/events` | Authenticated | Browse all events with hero section, register for events, view QR codes |
| **Dashboard** | `/admin` | Admin only | Admin dashboard with statistics, event management, quick actions |
| **StudentDashboard** | `/dashboard` | Student | Personal dashboard showing upcoming and past registered events |
| **EventRegistrations** | `/event/:eventId/registrations` | Authenticated | View all registrations for a specific event |
| **UserManagement** | `/users` | Admin only | Manage all users (view, edit, delete) |

### Components (`/client/src/components/`)

| Component | Purpose |
|-----------|---------|
| **Navbar** | App navigation with scroll-aware transparency, user menu, role-based links |
| **Hero** | Landing hero section on Events page with background image |
| **QRScanner** | Camera-based QR code scanner for marking attendance |
| **PrivateRoute** | Route guard for authenticated/admin-only routes |
| **PublicRoute** | Route guard that redirects logged-in users away from auth pages |

### Context (`/client/src/context/`)

| Context | Purpose |
|---------|---------|
| **AuthContext** | Global authentication state (user, token, login, register, logout) |

### Utilities (`/client/src/utils/`)

| Utility | Purpose |
|---------|---------|
| **imageUtils** | Helper to get event images (placeholder or uploaded) |

---

## Environment Variables

### Server (`/server/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventapp
JWT_SECRET=your_jwt_secret
```

### Client
The client uses optional environment variables:
- `REACT_APP_API_BASE` - API base URL (default: `http://localhost:5000/api`)
- `REACT_APP_SERVER_BASE` - Server base URL for images (default: `http://localhost:5000`)

---

## Running the Application

### Prerequisites
- Node.js installed
- MongoDB running locally

### Start Server
```bash
cd event-app/server
npm install
npm start
# Server runs on http://localhost:5000
```

### Start Client
```bash
cd event-app/client
npm install
npm start
# Client runs on http://localhost:3000
```

---

*Generated on May 10, 2026*
