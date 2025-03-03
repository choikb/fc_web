import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import DataManagement from "./pages/DataManagement";
import DataSharing from "./pages/DataSharing";
import ReportGeneration from "./pages/ReportGeneration";
import Settings from "./pages/Settings";
import SystemInfo from "./pages/SystemInfo";

const App = () => {
  const [currentView, setCurrentView] = useState("dataManagement");

  const handleCaseSelect = (caseName) => {
    console.log("Selected case:", caseName);
  };


  const renderContent = () => {
    switch (currentView) {
      case "dataManagement":
        return <DataManagement handleCaseSelect={handleCaseSelect} />;
      case "dataSharing":
        return <DataSharing handleCaseSelect={handleCaseSelect} />;
      case "reportGeneration":
        return <ReportGeneration handleCaseSelect={handleCaseSelect} />;
      case "settings":
        return <Settings handleCaseSelect={handleCaseSelect} />;
      case "systemInfo":
        return <SystemInfo handleCaseSelect={handleCaseSelect} />;
      default:
        return <DataManagement handleCaseSelect={handleCaseSelect} />;
    }
  };

  return (
    <Box sx={{ overflow: "hidden", display: "flex", flexDirection: "column",backgroundColor: "#f5f5f5", height: "100vh" }}>
      {/* 상단 메뉴바 */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            통합관제 시스템
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="text"
              sx={{ color: "#fff", textTransform: "none", fontWeight: "bold" }}
              onClick={() => setCurrentView("dataManagement")}
            >
              현장자료 관리
            </Button>
            <Button
              variant="text"
              sx={{ color: "#fff", textTransform: "none", fontWeight: "bold" }}
              onClick={() => setCurrentView("dataSharing")}
            >
              자료공유
            </Button>
            <Button
              variant="text"
              sx={{ color: "#fff", textTransform: "none", fontWeight: "bold" }}
              onClick={() => setCurrentView("reportGeneration")}
            >
              보고서 생성
            </Button>
            <Button
              variant="text"
              sx={{ color: "#fff", textTransform: "none", fontWeight: "bold" }}
              onClick={() => setCurrentView("settings")}
            >
              설정
            </Button>
            <Button
              variant="text"
              sx={{ color: "#fff", textTransform: "none", fontWeight: "bold" }}
              onClick={() => setCurrentView("systemInfo")}
            >
              시스템 정보
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 하단 콘텐츠 */}
      <Box sx={{ padding: 3, height: "calc(100% - 64px)" }}>{renderContent()}</Box>
    </Box>
  );
};

export default App;
