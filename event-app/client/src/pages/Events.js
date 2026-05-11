import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Skeleton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  LinearProgress,
} from "@mui/material";
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { getEventImage } from "../utils/imageUtils";
import Hero from "../components/Hero";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

const Events = () => {
  const { token, user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [qrDialog, setQrDialog] = useState({
    open: false,
    qrCode: "",
    eventTitle: "",
  });
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const eventsPerPage = 6;
  const eventsRef = useRef(null);

  useEffect(() => {
    const fetchEventsAndRegistrations = async () => {
      setLoading(true);
      setError("");
      try {
        const eventsRes = await axios.get(`${API_BASE}/events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setEvents(eventsRes.data);

        if (user && user.role === "student") {
          const regsRes = await axios.get(
            `${API_BASE}/registrations/my-registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const eventIds = new Set(regsRes.data.map((reg) => reg.event));
          setRegisteredEventIds(eventIds);
        }
      } catch (err) {
        setError("Failed to load events or registrations");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchEventsAndRegistrations();
  }, [token, user]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filter]);

  const handleRegister = async (eventId, eventTitle) => {
    setRegistering(eventId);
    try {
      const res = await axios.post(
        `${API_BASE}/registrations/${eventId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSnackbar({
        open: true,
        message: "Registration successful!",
        severity: "success",
      });
      setQrDialog({
        open: true,
        qrCode: res.data.registration.qrCode,
        eventTitle: eventTitle,
      });
      setRegisteredEventIds((prevIds) => new Set(prevIds).add(eventId));
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          "Registration failed. You may already be registered.",
        severity: "error",
      });
    } finally {
      setRegistering(null);
    }
  };

  const handleScrollToEvents = () => {
    eventsRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseQrDialog = () => {
    setQrDialog({ open: false, qrCode: "", eventTitle: "" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isEventUpcoming = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    return event >= today;
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && isEventUpcoming(event.date)) ||
      (filter === "past" && !isEventUpcoming(event.date));

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (page - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Events
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
              <Card sx={{ maxWidth: 280, mx: "auto" }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
    <>
      <Hero onBrowseClick={handleScrollToEvents} />
      <Box sx={{ py: 5, px: 2 }} ref={eventsRef}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Upcoming Events
        </Typography>

        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "center",
          }}
        >
          <TextField
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ minWidth: { xs: "100%", sm: 300 } }}
          />
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="event filter"
            size="small"
          >
            <ToggleButton value="all" aria-label="all events">
              All Events
            </ToggleButton>
            <ToggleButton value="upcoming" aria-label="upcoming events">
              Upcoming
            </ToggleButton>
            <ToggleButton value="past" aria-label="past events">
              Past
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" align="center">
                {events.length === 0
                  ? "No events found."
                  : "No events found matching your search."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {startIndex + 1}–
              {Math.min(endIndex, filteredEvents.length)} of{" "}
              {filteredEvents.length} events
            </Typography>
            <Grid container spacing={3}>
              {paginatedEvents.map((event) => {
                const isRegistered = registeredEventIds.has(event._id);
                const imageUrl = getEventImage(event);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={event._id}>
                    <Card
                      sx={{
                        height: "100%",
                        maxWidth: 280,
                        display: "flex",
                        flexDirection: "column",
                        mx: "auto",
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={imageUrl}
                        alt={event.title}
                        sx={{ objectFit: "cover", bgcolor: "grey.200" }}
                        onError={(e) => {
                          e.target.src = "/placeholder-event.svg";
                          e.target.onerror = null;
                        }}
                      />

                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography variant="h6" component="h2" gutterBottom>
                          {event.title}
                        </Typography>

                        {event.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {event.description}
                          </Typography>
                        )}

                        <Box sx={{ mb: 2 }}>
                          {event.location && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <LocationIcon
                                sx={{
                                  fontSize: 16,
                                  mr: 1,
                                  color: "text.secondary",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {event.location}
                              </Typography>
                            </Box>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <ScheduleIcon
                              sx={{
                                fontSize: 16,
                                mr: 1,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(event.date)}
                            </Typography>
                          </Box>

                          {/* Capacity Info */}
                          {event.isCapacityEnabled && (
                            <Box sx={{ mt: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Spots filled:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {event.registrationCount || 0}/
                                  {event.capacity}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(
                                  ((event.registrationCount || 0) /
                                    event.capacity) *
                                    100,
                                  100,
                                )}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: "grey.200",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor:
                                      (event.registrationCount || 0) >=
                                      event.capacity
                                        ? "error.main"
                                        : (event.registrationCount || 0) /
                                              event.capacity >=
                                            0.8
                                          ? "warning.main"
                                          : "success.main",
                                  },
                                }}
                              />
                              <Box sx={{ mt: 1 }}>
                                {(event.registrationCount || 0) >=
                                event.capacity ? (
                                  <Chip
                                    label="Waitlist Available"
                                    color="default"
                                    size="small"
                                  />
                                ) : (event.registrationCount || 0) /
                                    event.capacity >=
                                  0.8 ? (
                                  <Chip
                                    label="Almost Full"
                                    color="warning"
                                    size="small"
                                  />
                                ) : (
                                  <Chip
                                    label="Open"
                                    color="success"
                                    size="small"
                                  />
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {user && user.role === "student" && (
                          <Box sx={{ mt: "auto" }}>
                            {isRegistered ? (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Registered"
                                color="success"
                                variant="outlined"
                                sx={{ width: "100%" }}
                              />
                            ) : (
                              <Button
                                variant="contained"
                                fullWidth
                                onClick={() =>
                                  handleRegister(event._id, event.title)
                                }
                                disabled={registering === event._id}
                                startIcon={
                                  registering === event._id ? null : <QrIcon />
                                }
                              >
                                {registering === event._id
                                  ? "Registering..."
                                  : "Register"}
                              </Button>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* QR Code Dialog */}
        <Dialog
          open={qrDialog.open}
          onClose={handleCloseQrDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            QR Code for {qrDialog.eventTitle}
            <IconButton
              aria-label="close"
              onClick={handleCloseQrDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <img
                src={qrDialog.qrCode}
                alt="QR Code"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Show this QR code to the event organizer to mark your
                attendance.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQrDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Events;
