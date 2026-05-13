import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
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
  Avatar,
  Tooltip,
  Grid,
  TablePagination,
} from "@mui/material";
import {
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

const UserManagement = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user) => {
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setEditDialog({ open: true, user });
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(
        `${API_BASE}/auth/users/${editDialog.user._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });
      setEditDialog({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update user",
        severity: "error",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        await axios.delete(`${API_BASE}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({
          open: true,
          message: "User deleted successfully!",
          severity: "success",
        });
        fetchUsers();
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete user",
          severity: "error",
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate user statistics
  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const studentUsers = users.filter((user) => user.role === "student").length;
  const superadminUsers = users.filter(
    (user) => user.role === "superadmin",
  ).length;

  // Paginate users
  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
          User Management
        </Typography>
        <Box>
          <Tooltip title="Refresh Users">
            <IconButton onClick={fetchUsers} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleIcon
                  sx={{ fontSize: 40, color: "primary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
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
                <AdminIcon
                  sx={{ fontSize: 40, color: "secondary.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {adminUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Administrators
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
                <PersonIcon
                  sx={{ fontSize: 40, color: "success.main", mr: 2 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {studentUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Students
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
                <AdminIcon sx={{ fontSize: 40, color: "error.main", mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {superadminUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Superadmins
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Users
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor:
                              user.role === "superadmin"
                                ? "error.main"
                                : user.role === "admin"
                                  ? "secondary.main"
                                  : "primary.main",
                          }}
                        >
                          {user.name
                            ? user.name.charAt(0).toUpperCase()
                            : user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={
                          user.role === "superadmin"
                            ? "error"
                            : user.role === "admin"
                              ? "secondary"
                              : "primary"
                        }
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
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
          <TablePagination
            component="div"
            count={users.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 2, pb: 2 }}
          >
            Showing {page * rowsPerPage + 1}–
            {Math.min((page + 1) * rowsPerPage, users.length)} of {users.length}{" "}
            users
          </Typography>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            variant="outlined"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={editForm.role}
              label="Role"
              onChange={(e) =>
                setEditForm({ ...editForm, role: e.target.value })
              }
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              {currentUser?.role === "superadmin" && (
                <MenuItem value="superadmin">Superadmin</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>

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

export default UserManagement;
