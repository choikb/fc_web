import React from "react";
import { Card, CardContent, Typography, CircularProgress, Link } from "@mui/material";

const IncidentList = ({ incidentList, loading, onSelectIncident }) => {
  return (
    <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>
      <CardContent>
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
          🔥 화재 사건 목록
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <ul style={{ paddingLeft: "20px" }}>
            {incidentList?.map((incident) => (
              <li key={incident.incident_id} style={{ marginBottom: "10px" }}>
                <Link
                  href="#"
                  underline="hover"
                  sx={{ color: "#1976d2", cursor: "pointer" }}
                  onClick={() => onSelectIncident(incident.incident_id, incident.incident_name)}
                >
                  {incident.incident_name} ({incident.created_at})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentList;
