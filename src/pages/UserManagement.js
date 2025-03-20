import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { userService } from '../services/apiService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    name: '',
    organization: '',
    rank: '',
    role: '',
    email: '',
    phoneNumber: '',
    firestationId: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setSnackbar({
        open: true,
        message: '사용자 목록을 불러오는데 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        userSeq: user.userSeq,
        userId: user.userId,
        password: '',
        name: user.name || '',
        organization: user.organization || '',
        rank: user.rank || '',
        role: user.role || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        firestationId: user.firestationId || ''
      });
    } else {
      setCurrentUser(null);
      setFormData({
        userSeq: '',
        userId: '',
        password: '',
        name: '',
        organization: '',
        rank: '',
        role: '',
        email: '',
        phoneNumber: '',
        firestationId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      if (currentUser) {
        // Update existing user
        await userService.updateUser(formData);
        setSnackbar({
          open: true,
          message: '사용자 정보가 성공적으로 업데이트되었습니다.',
          severity: 'success'
        });
      } else {
        // Create new user
        await userService.createUser(formData);
        setSnackbar({
          open: true,
          message: '새 사용자가 성공적으로 생성되었습니다.',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);

      // Extract error message from the response if available
      let errorMessage = '사용자 저장에 실패했습니다.';

      // Check if we have a response with an error message
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // If we have a direct error message
        errorMessage = error.message;
      }

      // Check specifically for duplicate ID error
      if (errorMessage.includes('이미 사용 중인 아이디')) {
        errorMessage = '이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async (userSeq) => {
    if (window.confirm('이 사용자를 삭제하시겠습니까?')) {
      try {
        await userService.deleteUser({ userSeq });
        setSnackbar({
          open: true,
          message: '사용자가 성공적으로 삭제되었습니다.',
          severity: 'success'
        });
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        setSnackbar({
          open: true,
          message: '사용자 삭제에 실패했습니다.',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          사용자 관리
        </Typography>
        {/*<Button*/}
        {/*  variant="contained"*/}
        {/*  color="primary"*/}
        {/*  onClick={() => handleOpenDialog()}*/}
        {/*>*/}
        {/*  새 사용자 추가*/}
        {/*</Button>*/}
      </Box>

      <Paper sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
          <Table stickyHeader aria-label="사용자 테이블">
            <TableHead>
              <TableRow>
                <TableCell>사용자 ID</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>소속</TableCell>
                <TableCell>직급</TableCell>
                <TableCell>역할</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.organization}</TableCell>
                    <TableCell>{user.rank}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user.userSeq)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    등록된 사용자가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* User Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentUser ? '사용자 정보 수정' : '새 사용자 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              name="userId"
              label="사용자 ID"
              fullWidth
              value={formData.userId}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="password"
              label="비밀번호"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleInputChange}
              required={!currentUser}
              helperText={currentUser ? "변경하지 않으려면 비워두세요" : ""}
            />
            <TextField
              name="name"
              label="이름"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              name="organization"
              label="소속"
              fullWidth
              value={formData.organization}
              onChange={handleInputChange}
            />
            <TextField
              name="rank"
              label="직급"
              fullWidth
              value={formData.rank}
              onChange={handleInputChange}
            />
            <TextField
              name="role"
              label="역할"
              fullWidth
              value={formData.role}
              onChange={handleInputChange}
            />
            <TextField
              name="email"
              label="이메일"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              name="phoneNumber"
              label="연락처"
              fullWidth
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
            <TextField
              name="firestationId"
              label="소방서 ID"
              fullWidth
              value={formData.firestationId}
              onChange={handleInputChange}
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
