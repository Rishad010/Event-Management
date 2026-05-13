import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import {
  Event as EventIcon,
  Dashboard as DashboardIcon,
  QrCodeScanner as QrIcon,
  Logout,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [navBackground, setNavBackground] = useState("transparent");

  const handleScroll = () => {
    const show = window.scrollY > 50;
    if (show) {
      setNavBackground("paper");
    } else {
      setNavBackground("transparent");
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={navBackground === "transparent" ? 0 : 1}
      sx={{
        backgroundColor:
          navBackground === "transparent" ? "transparent" : "background.paper",
        color: navBackground === "transparent" ? "white" : "text.primary",
        transition: "background-color 0.3s, color 0.3s, box-shadow 0.3s",
      }}
    >
      <Toolbar>
        <EventIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Event Manager
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/events"
            startIcon={<EventIcon />}
          >
            Events
          </Button>

          {user && user.role === "admin" && (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/admin"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/scan"
                startIcon={<QrIcon />}
              >
                Scan QR
              </Button>
            </>
          )}

          {user ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                >
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">
                    {user.name || user.email}
                  </Typography>
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/dashboard"
                  onClick={handleClose}
                >
                  <DashboardIcon sx={{ mr: 1 }} />
                  My Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/register"
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
