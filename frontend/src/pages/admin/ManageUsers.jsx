import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  CircularProgress,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { UserPlus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLES = ['EMPLOYEE', 'AGENT', 'ADMIN', 'TEAM_LEAD'];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  // Search & Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [password, setPassword] = useState(''); // Only used when adding
  const [submitting, setSubmitting] = useState(false);



  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getUsers();
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user directory');
      showNotification('Could not read user accounts from database', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedUserId(null);
    setFullName('');
    setEmail('');
    setRole('EMPLOYEE');
    setPassword('');
    setError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setIsEdit(true);
    setSelectedUserId(user.userId);
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
    setPassword('***'); // Dummy representation
    setError('');
    setOpenDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !role || (!isEdit && !password)) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      if (isEdit) {
        await userAPI.updateUser(selectedUserId, { fullName, email, role });
        showNotification('User profile modified successfully!', 'success');
      } else {
        await userAPI.addUser({ fullName, email, role, passwordHash: password });
        showNotification('New user registered successfully!', 'success');
      }
      setSubmitting(false);
      setOpenDialog(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      setSubmitting(false);
      setError('Failed to save user. Check if email is already taken.');
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user account? All associated records will remain intact.')) {
      try {
        await userAPI.deleteUser(userId);
        showNotification('User account removed.', 'info');
        fetchUsers();
      } catch (err) {
        console.error(err);
        showNotification('Failed to remove user account', 'error');
      }
    }
  };

  const getRoleColors = (role) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#DC262615', text: '#DC2626' };
      case 'AGENT':
        return { bg: '#0D948815', text: '#0D9488' };
      case 'TEAM_LEAD':
        return { bg: '#D9770615', text: '#D97706' };
      case 'EMPLOYEE':
      default:
        return { bg: '#8B80F915', text: '#8B80F9' };
    }
  };

  // Filtered and searched list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.userId).includes(searchTerm);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: 'var(--text-primary)' }}>
            User Directory Management
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Manage system access roles, user details, and authorization profiles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus size={18} />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Add User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

      {/* Search and Filters Block */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search by name, email, or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '250px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          label="Filter by Role"
          sx={{ width: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Filter size={16} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="ALL">All Roles</MenuItem>
          {ROLES.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Users Table */}
      <TableContainer className="modern-table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>System Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => {
              const roleColors = getRoleColors(u.role);
              return (
                <TableRow key={u.userId} hover>
                  <TableCell sx={{ fontWeight: 700 }}>#{u.userId}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{u.fullName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      size="small"
                      sx={{
                        backgroundColor: roleColors.bg,
                        color: roleColors.text,
                        fontWeight: 700,
                        borderRadius: '6px'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(u)}
                        sx={{
                          p: 1,
                          backgroundColor: 'action.hover',
                          borderRadius: '8px',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(u.userId)}
                        sx={{
                          p: 1,
                          backgroundColor: 'action.hover',
                          borderRadius: '8px',
                          '&:hover': { color: 'error.main' }
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEdit ? 'Modify User Profile' : 'Register New User'}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
            <TextField
              required
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@company.com"
            />
            {!isEdit && (
              <TextField
                required
                fullWidth
                type="password"
                label="Security Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            )}
            <TextField
              required
              select
              fullWidth
              label="System Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save User'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default ManageUsers;

