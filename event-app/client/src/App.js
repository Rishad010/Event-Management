import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container, Box } from "@mui/material";
import theme from "./theme";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import QRScanner from "./components/QRScanner";
import EventRegistrations from "./pages/EventRegistrations";
import UserManagement from "./pages/UserManagement";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box
            sx={{
              minHeight: "100vh",
              backgroundImage: "linear-gradient(to bottom, #2c3e50, #3498db)",
              backgroundSize: "cover",
              backgroundAttachment: "fixed",
            }}
          >
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 4, pt: { xs: 10, md: 12 } }}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password/:token"
                  element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/update-password"
                  element={
                    <PublicRoute>
                      <UpdatePassword />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <PrivateRoute>
                      <Events />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <StudentDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute adminOnly>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <PrivateRoute adminOnly>
                      <UserManagement />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/scan"
                  element={
                    <PrivateRoute>
                      <QRScanner />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/event/:eventId/registrations"
                  element={
                    <PrivateRoute>
                      <EventRegistrations />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/events" />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
