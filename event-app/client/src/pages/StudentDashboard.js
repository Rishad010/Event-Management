import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Skeleton,
  Alert,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CardMedia,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  QrCode as QrIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Upcoming as UpcomingIcon,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { getEventImage } from "../utils/imageUtils";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

const StudentDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrDialog, setQrDialog] = useState({
    open: false,
    qrCode: "",
    eventTitle: "",
  });

  useEffect(() => {
    if (token) {
      const fetchRegistrations = async () => {
        setLoading(true);
        setError("");
        try {
          const res = await axios.get(
            `${API_BASE}/registrations/my-registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setRegistrations(res.data);
        } catch (err) {
          setError("Failed to load your registrations.");
        } finally {
          setLoading(false);
        }
      };
      fetchRegistrations();
    }
  }, [token]);

  const handleShowQr = (qrCode, eventTitle) => {
    setQrDialog({ open: true, qrCode, eventTitle });
  };

  const handleCloseQrDialog = () => {
    setQrDialog({ open: false, qrCode: "", eventTitle: "" });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = new Date();
  // Filter out registrations with missing or null event
  const validRegistrations = registrations.filter(
    (reg) => reg.event && reg.event.date,
  );
  const upcomingEvents = validRegistrations.filter(
    (reg) => new Date(reg.event.date) >= now,
  );
  const pastEvents = validRegistrations.filter(
    (reg) => new Date(reg.event.date) < now,
  );

  const renderEventCard = (registration) => {
    if (!registration.event) {
      return null; // Defensive: skip rendering if event is missing
    }
    const imageUrl = getEventImage(registration.event);
    return (
      <Grid item xs={12} md={6} key={registration._id}>
        <Card sx={{ display: "flex" }}>
          <CardMedia
            component="img"
            sx={{ width: 151 }}
            image={imageUrl}
            alt={registration.event.title || "Event"}
          />
          <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
            <CardContent>
              <Typography component="div" variant="h6">
                {registration.event.title || "Event Deleted"}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {registration.event.date
                  ? formatDate(registration.event.date)
                  : "Date not available"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationIcon
                  sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {registration.event.location || "Location not available"}
                </Typography>
              </Box>
              <Chip
                label={registration.attendance ? "Attended" : "Registered"}
                color={registration.attendance ? "success" : "primary"}
                variant="outlined"
                size="small"
              />
            </CardContent>
            <Box sx={{ display: "flex", alignItems: "center", pl: 2, pb: 2 }}>
              {registration.event.date &&
                new Date(registration.event.date) >= now && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<QrIcon />}
                    onClick={() =>
                      handleShowQr(
                        registration.qrCode,
                        registration.event.title,
                      )
                    }
                  >
                    Show QR Code
                  </Button>
                )}
            </Box>
          </Box>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          My Dashboard
        </Typography>
        <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={150} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        My Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user?.name}!
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <UpcomingIcon sx={{ mr: 1, color: "primary.main" }} /> Upcoming Events
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {upcomingEvents.length > 0 ? (
          <Grid container spacing={2}>
            {upcomingEvents.map(renderEventCard)}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            You have no upcoming registered events.
          </Typography>
        )}
      </Box>

      <Box>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HistoryIcon sx={{ mr: 1, color: "text.secondary" }} /> Past Events
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {pastEvents.length > 0 ? (
          <Grid container spacing={2}>
            {pastEvents.map(renderEventCard)}
          </Grid>
        ) : (
          <Typography color="text.secondary">
            You have no past registered events.
          </Typography>
        )}
      </Box>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog.open} onClose={handleCloseQrDialog}>
        <DialogTitle>
          QR Code for {qrDialog.eventTitle}
          <IconButton
            onClick={handleCloseQrDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <img
            src={qrDialog.qrCode}
            alt="QR Code"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
