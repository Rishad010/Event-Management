import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

const EventRegistrations = () => {
  const { eventId } = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${API_BASE}/registrations/event/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setRegistrations(res.data);
      } catch (err) {
        setError("Failed to load registrations");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [eventId, token]);

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Event Registrations</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : registrations.length === 0 ? (
        <div>No one has registered for this event yet.</div>
      ) : (
        <table
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Email</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>
                Attendance
              </th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg._id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {reg.user?.name || "Unknown"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {reg.user?.email || "N/A"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  {reg.attendance ? "Present" : "Absent"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EventRegistrations;
