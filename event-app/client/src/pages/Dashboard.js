import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Skeleton,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Fab,
  Tooltip,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  QrCodeScanner as QrIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [summary, setSummary] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [createEventDialog, setCreateEventDialog] = useState(false);
  const [editEventDialog, setEditEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    image: null,
    capacity: 50,
    isCapacityEnabled: false,
  });
  const [newEventImage, setNewEventImage] = useState(null);
  const [editEventImage, setEditEventImage] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, eventsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/registrations/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSummary(summaryRes.data);
      setEvents(eventsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    const formData = new FormData();
    formData.append("title", newEvent.title);
    formData.append("description", newEvent.description);
    formData.append("location", newEvent.location);
    formData.append("date", newEvent.date);
    formData.append("capacity", newEvent.capacity);
    formData.append("isCapacityEnabled", newEvent.isCapacityEnabled);
    if (newEventImage) {
      formData.append("image", newEventImage);
    }

    try {
      await axios.post(`${API_BASE}/events`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSnackbar({
        open: true,
        message: "Event created successfully!",
        severity: "success",
      });
      setCreateEventDialog(false);
      setNewEvent({
        title: "",
        description: "",
        location: "",
        date: "",
        image: null,
        capacity: 50,
        isCapacityEnabled: false,
      });
      setNewEventImage(null);
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create event",
        severity: "error",
      });
    }
  };

  const handleOpenEditDialog = (event) => {
    const formattedDate = event.date
      ? new Date(
          new Date(event.date).getTime() -
            new Date(event.date).getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16)
      : "";
    setEditingEvent({ ...event, date: formattedDate });
    setEditEventDialog(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    const formData = new FormData();
    formData.append("title", editingEvent.title);
    formData.append("description", editingEvent.description);
    formData.append("location", editingEvent.location);
    formData.append("date", editingEvent.date);
    formData.append("capacity", editingEvent.capacity || 50);
    formData.append(
      "isCapacityEnabled",
      editingEvent.isCapacityEnabled || false,
    );
    if (editEventImage) {
      formData.append("image", editEventImage);
    }

    try {
      await axios.put(`${API_BASE}/events/${editingEvent._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSnackbar({
        open: true,
        message: "Event updated successfully!",
        severity: "success",
      });
      setEditEventDialog(false);
      setEditEventImage(null);
      fetchDashboardData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update event",
        severity: "error",
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`${API_BASE}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "Event deleted successfully!",
          severity: "success",
        });
        fetchDashboardData();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete event",
          severity: "error",
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_BASE}/registrations/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "registrations.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "Export successful!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Export failed",
        severity: "error",
      });
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate dashboard statistics
  const totalEvents = events.length;
  const totalRegistrations = summary.reduce((sum, item) => sum + item.total, 0);
  const totalAttendance = summary.reduce((sum, item) => sum + item.present, 0);
  const attendanceRate =
    totalRegistrations > 0
      ? ((totalAttendance / totalRegistrations) * 100).toFixed(1)
      : 0;

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
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
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchDashboardData} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateEventDialog(true)}
          >
            Create Event
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EventIcon
                  sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalEvents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon
                  sx={{ fontSize: 40, color: "secondary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalRegistrations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Registrations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <QrIcon sx={{ fontSize: 40, color: "success.main", mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalAttendance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Attendance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUpIcon
                  sx={{ fontSize: 40, color: "info.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {attendanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Summary Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Event Summary</Typography>
            <Button
              variant="outlined"
              startIcon={
                exporting ? <CircularProgress size={20} /> : <DownloadIcon />
              }
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export to Excel"}
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell align="center">Registrations</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Attendance Rate</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.map((item) => {
                  const rate =
                    item.total > 0
                      ? ((item.present / item.total) * 100).toFixed(1)
                      : 0;
                  return (
                    <TableRow key={item.eventId}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {item.title}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.total}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.present}
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${rate}%`}
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Registrations">
                          <IconButton
                            component={Link}
                            to={`/event/${item.eventId}/registrations`}
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Events
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.slice(0, 5).map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {event.title}
                          </Typography>
                          {event.description && (
                            <Typography variant="body2" color="text.secondary">
                              {event.description.substring(0, 50)}...
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{event.location || "TBD"}</TableCell>
                        <TableCell>{formatDate(event.date)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit Event">
                            <IconButton
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => handleOpenEditDialog(event)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Event">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteEvent(event._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <List>
                <ListItem button component={Link} to="/scan">
                  <ListItemAvatar>
                    <Avatar>
                      <QrIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Scan QR Code"
                    secondary="Mark attendance"
                  />
                </ListItem>
                <ListItem button onClick={() => setCreateEventDialog(true)}>
                  <ListItemAvatar>
                    <Avatar>
                      <AddIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Create Event"
                    secondary="Add new event"
                  />
                </ListItem>
                <ListItem button component={Link} to="/users">
                  <ListItemAvatar>
                    <Avatar>
                      <PeopleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Manage Users"
                    secondary="View all users"
                  />
                </ListItem>
                <ListItem button>
                  <ListItemAvatar>
                    <Avatar>
                      <SettingsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Settings"
                    secondary="App configuration"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Event Dialog */}
      <Dialog
        open={createEventDialog}
        onClose={() => setCreateEventDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            variant="outlined"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newEvent.description}
            onChange={(e) =>
              setNewEvent({ ...newEvent, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={newEvent.location}
            onChange={(e) =>
              setNewEvent({ ...newEvent, location: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date & Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newEvent.isCapacityEnabled}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    isCapacityEnabled: e.target.checked,
                  })
                }
              />
            }
            label="Enable capacity limit"
            sx={{ mt: 2, mb: 1 }}
          />
          {newEvent.isCapacityEnabled && (
            <TextField
              margin="dense"
              label="Capacity"
              type="number"
              fullWidth
              variant="outlined"
              value={newEvent.capacity}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  capacity: Math.max(1, parseInt(e.target.value) || 50),
                })
              }
              inputProps={{ min: 1 }}
              sx={{ mb: 2 }}
            />
          )}
          <Button variant="contained" component="label" fullWidth>
            Upload Banner Image
            <input
              type="file"
              hidden
              onChange={(e) => setNewEventImage(e.target.files[0])}
            />
          </Button>
          {newEventImage && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {newEventImage.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateEventDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">
            Create Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <Dialog
          open={editEventDialog}
          onClose={() => setEditEventDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Event Title"
              fullWidth
              variant="outlined"
              value={editingEvent.title}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editingEvent.description}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  description: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Location"
              fullWidth
              variant="outlined"
              value={editingEvent.location}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, location: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Date & Time"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={editingEvent.date}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" component="label" fullWidth>
              Upload New Banner Image
              <input
                type="file"
                hidden
                onChange={(e) => setEditEventImage(e.target.files[0])}
              />
            </Button>
            {editEventImage && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {editEventImage.name}
              </Typography>
            )}
            {editingEvent?.image && !editEventImage && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Current image: {editingEvent.image.split("/").pop()}
              </Typography>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={editingEvent.isCapacityEnabled || false}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      isCapacityEnabled: e.target.checked,
                    })
                  }
                />
              }
              label="Enable capacity limit"
              sx={{ mt: 2, mb: 1 }}
            />
            {editingEvent.isCapacityEnabled && (
              <TextField
                margin="dense"
                label="Capacity"
                type="number"
                fullWidth
                variant="outlined"
                value={editingEvent.capacity || 50}
                onChange={(e) =>
                  setEditingEvent({
                    ...editingEvent,
                    capacity: Math.max(1, parseInt(e.target.value) || 50),
                  })
                }
                inputProps={{ min: 1 }}
                sx={{ mb: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditEventDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateEvent} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
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
    </Box>
  );
};

export default Dashboard;
