import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip
} from "@mui/material";
import { AccountCircle, ExitToApp, Settings as SettingsIcon } from "@mui/icons-material";
import DataManagement from "./pages/DataManagement";
import DataSharing from "./pages/DataSharing";
import ReportGeneration from "./pages/ReportGeneration";
import Settings from "./pages/Settings";
import SystemInfo from "./pages/SystemInfo";
import Login from "./pages/Login";
import { userService } from "./services/apiService";
import UserManagement from "./pages/UserManagement";

const App = () => {
  const [currentView, setCurrentView] = useState("dataManagement");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = userService.isAuthenticated();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        setCurrentUser(userService.getCurrentUser());
      }
    };

    // Check auth on initial load
    checkAuth();

    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCaseSelect = (caseName) => {
    console.log("Selected case:", caseName);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentUser(userService.getCurrentUser());

    // Restore the last view if available, otherwise go to dataManagement
    const lastView = sessionStorage.getItem('lastView');
    if (lastView) {
      setCurrentView(lastView);
      sessionStorage.removeItem('lastView');
    } else {
      setCurrentView("dataManagement");
    }
  };

  const handleLogout = () => {
    userService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    handleCloseUserMenu();
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
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
      case "userManagement":
        return <UserManagement />;
      case "systemInfo":
        return <SystemInfo handleCaseSelect={handleCaseSelect} />;
      default:
        return <DataManagement handleCaseSelect={handleCaseSelect} />;
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    // Save the current view before redirecting to login
    // This will allow us to return to the same view after login
    if (currentView !== 'login') {
      sessionStorage.setItem('lastView', currentView);
    }
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
    const handleDownload = () => {
        const fileUrl = "/install/fc_android.apk";
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", "fc_android.apk");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
  return (
    <Box sx={{ overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#f5f5f5", height: "100vh" }}>
      {/* 상단 메뉴바 */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            통합관제 시스템
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                    variant="text"
                    sx={{
                        color: "rgba(255,255,255,0.7)",
                        textTransform: "none",
                        fontWeight: "bold",
                        borderBottom: "none",
                        borderRadius: 0,
                        paddingBottom: "4px"
                    }}
                    onClick={() => handleDownload()}
                >
                    설치파일 다운로드
                </Button>
              <Button
                variant="text"
                sx={{
                  color: currentView === "dataManagement" ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderBottom: currentView === "dataManagement" ? "2px solid white" : "none",
                  borderRadius: 0,
                  paddingBottom: "4px"
                }}
                onClick={() => setCurrentView("dataManagement")}
              >
                현장자료 관리
              </Button>
              <Button
                variant="text"
                sx={{
                  color: currentView === "dataSharing" ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderBottom: currentView === "dataSharing" ? "2px solid white" : "none",
                  borderRadius: 0,
                  paddingBottom: "4px"
                }}
                onClick={() => setCurrentView("dataSharing")}
              >
                자료공유
              </Button>
              <Button
                variant="text"
                sx={{
                  color: currentView === "reportGeneration" ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderBottom: currentView === "reportGeneration" ? "2px solid white" : "none",
                  borderRadius: 0,
                  paddingBottom: "4px"
                }}
                onClick={() => setCurrentView("reportGeneration")}
              >
                보고서 생성
              </Button>
              <Button
                variant="text"
                sx={{
                  color: currentView === "settings" ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderBottom: currentView === "settings" ? "2px solid white" : "none",
                  borderRadius: 0,
                  paddingBottom: "4px"
                }}
                onClick={() => setCurrentView("settings")}
              >
                설정
              </Button>
              <Button
                variant="text"
                sx={{
                  color: currentView === "userManagement" ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderBottom: currentView === "userManagement" ? "2px solid white" : "none",
                  borderRadius: 0,
                  paddingBottom: "4px"
                }}
                onClick={() => setCurrentView("userManagement")}
              >
                사용자 관리
              </Button>
              <Button
                variant="text"
                sx={{
                  color: currentView === "systemInfo" ? "#fff" : "rgba(255,255,255,0.7)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderBottom: currentView === "systemInfo" ? "2px solid white" : "none",
                  borderRadius: 0,
                  paddingBottom: "4px"
                }}
                onClick={() => setCurrentView("systemInfo")}
              >
                시스템 정보
              </Button>
            </Box>

            {/* User profile menu */}
            <Box sx={{ ml: 2 }}>
              <Tooltip title={currentUser?.name || currentUser?.user_id || "사용자"}>
                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0, ml: 2 }}>
                  <Avatar
                    alt={currentUser?.name || "User"}
                    src="/static/images/avatar/2.jpg"
                    sx={{ bgcolor: "#1565c0" }}
                  >
                    {(currentUser?.name || currentUser?.user_id || "U").charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleCloseUserMenu}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {currentUser?.name || currentUser?.user_id || "사용자"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentUser?.organization || ""} {currentUser?.rank || ""}
                  </Typography>
                </Box>
                <Divider />
                {/*<MenuItem onClick={() => {*/}
                {/*  setCurrentView("settings");*/}
                {/*  handleCloseUserMenu();*/}
                {/*}}>*/}
                {/*  <SettingsIcon fontSize="small" sx={{ mr: 1 }} />*/}
                {/*  <Typography textAlign="center">계정 설정</Typography>*/}
                {/*</MenuItem>*/}
                <MenuItem onClick={handleLogout}>
                  <ExitToApp fontSize="small" sx={{ mr: 1 }} />
                  <Typography textAlign="center">로그아웃</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 하단 콘텐츠 */}
      <Box sx={{ padding: 3, height: "calc(100% - 64px)" }}>{renderContent()}</Box>
    </Box>
  );
};

export default App;
