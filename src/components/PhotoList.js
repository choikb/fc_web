import React from "react";
import { Card, CardContent, Typography, IconButton, Link } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const PhotoList = ({ photoList, selectedCase, showCasePhotos, onToggleCasePhotos }) => {
  return (
    showCasePhotos && (
      <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
            사건: {selectedCase}
            <IconButton onClick={onToggleCasePhotos} sx={{ color: "#1976d2" }}>
              <ChevronLeftIcon />
            </IconButton>
          </Typography>

          <ul style={{ paddingLeft: "10px", marginTop: "10px" }}>
            {photoList.map((media, idx) => (
              <li key={idx} style={{ marginBottom: "5px" }}>
                <Link
                  href={`https://your-storage-url.com/uploads/${media.file_name}`}
                  target="_blank"
                  underline="hover"
                  sx={{ color: "#1976d2" }}
                >
                  {media.file_name}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )
  );
};

export default PhotoList;
