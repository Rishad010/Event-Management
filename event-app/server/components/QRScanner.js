import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const QRScanner = () => {
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const handleScan = async (data) => {
    if (data && data !== result) {
      setResult(data);

      try {
        const token = localStorage.getItem('token');
        await axios.post(
          '/api/registrations/mark-attendance',
          { qrData: data },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('✅ Attendance marked!');
      } catch (error) {
        alert(error.response?.data?.message || 'Error marking attendance');
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    alert('Camera error');
  };

  return (
    <div>
      <h2>Scan QR to Mark Attendance</h2>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '100%' }}
      />
      {result && <p>Scanned: {result}</p>}
    </div>
  );
};

export default QRScanner;
