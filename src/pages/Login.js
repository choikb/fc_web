import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Lock } from '@mui/icons-material';
import { userService } from '../services/apiService';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    userId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (userService.isAuthenticated()) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate form
    if (!credentials.userId || !credentials.password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userService.login(credentials);

      if (response && response.userId) {
        console.log('로그인 성공:', response);
        onLoginSuccess();
      } else {
        throw new Error('로그인 정보가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      setError(error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: 3
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          통합관제 시스템
        </Typography>
      </Paper>

      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            bgcolor: '#1976d2',
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
            로그인
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
            계정 정보를 입력하여 시스템에 접속하세요
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="userId"
              label="아이디"
              name="userId"
              autoComplete="username"
              autoFocus
              value={credentials.userId}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 4 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
                mb: 2,
                borderRadius: 2,
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 4px 20px 0 rgba(61, 71, 82, 0.1), 0 0 0 0 rgba(0, 127, 255, 0)'
              }}
            >
              {loading ? <CircularProgress size={24} /> : '로그인'}
            </Button>
              <Button
                  type="button"
                  onClick={() => handleDownload()}
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                      py: 1.5,
                      mt: 1,
                      mb: 2,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 20px 0 rgba(61, 71, 82, 0.1), 0 0 0 0 rgba(0, 127, 255, 0)'
                  }}
              >
                  {loading ? <CircularProgress size={24} /> : '설치파일다운로드'}
              </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" sx={{ mt: 4, color: 'rgba(0, 0, 0, 0.6)' }}>
        © {new Date().getFullYear()} 통합관제 시스템. All rights reserved.
      </Typography>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;
