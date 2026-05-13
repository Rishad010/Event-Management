import React, { useEffect, useState, useContext } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import {
  QrCodeScanner as QrIcon,
  Person as PersonIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";
const QR_SCANNER_ID = "qr-reader";

const QRScanner = () => {
  const { token } = useContext(AuthContext);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let html5QrCode;
    if (isScanning && !scanResult) {
      html5QrCode = new Html5Qrcode(QR_SCANNER_ID);
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      const startScanner = async () => {
        try {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure,
          );
        } catch (err) {
          setScanError(
            "Failed to start camera. Please ensure permissions are granted.",
          );
        }
      };

      startScanner();

      return () => {
        const stopScanner = async () => {
          if (html5QrCode && html5QrCode.isScanning) {
            try {
              await html5QrCode.stop();
            } catch (err) {
              console.error("Failed to stop scanner cleanly", err);
            }
          }
        };
        stopScanner();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning, scanResult]);

  const onScanSuccess = async (decodedText) => {
    setIsScanning(false);
    setIsLoading(true);
    setScanError("");
    try {
      const res = await axios.post(
        `${API_BASE}/registrations/mark-attendance`,
        { qrData: decodedText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Let's assume the backend returns registration details on success
      setScanResult({
        success: true,
        message: res.data.message || "Attendance marked successfully!",
        details: res.data.registration,
      });
    } catch (err) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || "Failed to mark attendance.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onScanFailure = (error) => {
    // This can be noisy, so we'll just log it for debugging
    // console.log(`QR scan error: ${error}`);
  };

  const handleRescan = () => {
    setScanResult(null);
    setScanError("");
    setIsScanning(true);
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", p: 2 }}>
      <CardContent sx={{ textAlign: "center" }}>
        <QrIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          QR Code Scanner
        </Typography>

        <Box
          sx={{
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            my: 2,
          }}
        >
          {isScanning && !scanError && (
            <Paper
              variant="outlined"
              sx={{
                width: 300,
                height: 300,
                position: "relative",
                overflow: "hidden",
                "& div": {
                  width: "100%",
                  height: "100%",
                },
                "& video": {
                  width: "100% !important",
                  height: "100% !important",
                  objectFit: "cover",
                },
              }}
            >
              <div id={QR_SCANNER_ID} />
            </Paper>
          )}

          {scanError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {scanError}
            </Alert>
          )}

          {isLoading && <CircularProgress sx={{ my: 4 }} />}

          {scanResult && (
            <Box sx={{ width: "100%" }}>
              <Alert severity={scanResult.success ? "success" : "error"}>
                {scanResult.message}
              </Alert>

              {scanResult.details && (
                <Card variant="outlined" sx={{ mt: 2, textAlign: "left" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Registration Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography>
                        <b>User:</b> {scanResult.details.user.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <EventIcon sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography>
                        <b>Event:</b> {scanResult.details.event.title}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>

        {scanResult && (
          <Button
            variant="contained"
            onClick={handleRescan}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Scan Another Ticket
          </Button>
        )}

        {!isScanning && !scanResult && !isLoading && (
          <Button
            variant="contained"
            onClick={handleRescan}
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
          >
            Start Scanner
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
