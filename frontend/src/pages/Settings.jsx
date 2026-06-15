import { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, Switch, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { User, Shield, Moon, Sun, Bell, Monitor, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeToggle();
  const { showNotification } = useNotification();

  const isLight = mode === 'light';

  // Password Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleOpenDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setDialogOpen(false);
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    // Simulate backend network update
    setTimeout(() => {
      setIsSubmitting(false);
      setDialogOpen(false);
      showNotification('Security password updated successfully!', 'success');
    }, 1200);
  };

  // Role chip color generator
  const getRoleColors = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return {
          bg: isLight ? '#FEF2F2' : '#450A0A',
          border: isLight ? '#FEE2E2' : '#7F1D1D',
          text: isLight ? '#DC2626' : '#EF4444',
        };
      case 'AGENT':
        return {
          bg: isLight ? '#F0FDF4' : '#064E3B',
          border: isLight ? '#DCFCE7' : '#065F46',
          text: isLight ? '#16A34A' : '#10B981',
        };
      case 'TEAM_LEAD':
        return {
          bg: isLight ? '#FFFBEB' : '#78350F',
          border: isLight ? '#FEF3C7' : '#92400E',
          text: isLight ? '#D97706' : '#F59E0B',
        };
      default:
        return {
          bg: isLight ? '#EEF2FF' : '#1E1B4B',
          border: isLight ? '#E0E7FF' : '#312E81',
          text: isLight ? '#4F46E5' : '#6366F1',
        };
    }
  };

  const roleColors = getRoleColors(user?.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Box sx={{ maxWidth: '1000px', mx: 'auto', p: { xs: 1, sm: 2 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Settings & Preferences
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 4 }}>
          Manage your system configurations, user profiles, and theme preferences.
        </Typography>

        <Grid container spacing={3}>
          {/* User Profile Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                backgroundColor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: '8px',
                      backgroundColor: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
                      color: isLight ? '#4F46E5' : '#6366F1',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <User size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      User Profile
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Personal details & role credentials
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Full Name Block */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: isLight ? '#F9FAFB' : '#222225',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
                      FULL NAME
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {user?.fullName || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Email Block */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: isLight ? '#F9FAFB' : '#222225',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
                      EMAIL ADDRESS
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {user?.email || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Role Block */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: isLight ? '#F9FAFB' : '#222225',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: '0.05em' }}>
                        SYSTEM ROLE
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {user?.role || 'N/A'}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: roleColors.bg,
                        border: '1px solid',
                        borderColor: roleColors.border,
                        color: roleColors.text,
                      }}
                    >
                      {user?.role || 'N/A'}
                    </Box>
                  </Box>

                  {/* Status Block */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: isLight ? '#F9FAFB' : '#222225',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'success.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', letterSpacing: '0.05em' }}>
                        ACCOUNT STATUS
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main', mt: 0.25 }}>
                        Active & Verified
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Preferences Settings */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                backgroundColor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: '8px',
                      backgroundColor: isLight ? 'rgba(22, 163, 74, 0.08)' : 'rgba(34, 197, 94, 0.15)',
                      color: isLight ? '#16A34A' : '#22C55E',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Monitor size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      System Preferences
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tailor your system interface
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Theme Switch Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: mode === 'dark' ? '#6366F1' : '#6B7280', display: 'flex' }}>
                        {mode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Dark Theme Mode
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Toggle between light and dark themes
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={mode === 'dark'}
                      onChange={toggleTheme}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: isLight ? '#4F46E5' : '#6366F1',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: isLight ? '#4F46E5' : '#6366F1',
                        },
                      }}
                    />
                  </Box>

                  {/* Email Notifications Switch Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: '#6B7280', display: 'flex' }}>
                        <Bell size={18} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Email Notifications
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get updates about ticket assignments
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      defaultChecked
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: isLight ? '#4F46E5' : '#6366F1',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: isLight ? '#4F46E5' : '#6366F1',
                        },
                      }}
                    />
                  </Box>

                  {/* MFA Security Switch Row */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: 0.75,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: '#6B7280', display: 'flex' }}>
                        <Shield size={18} />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Two-Factor Authentication
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Add an extra layer of protection (SAML)
                        </Typography>
                      </Box>
                    </Box>
                    <Switch defaultChecked={false} disabled color="primary" />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Password Action */}
                  <Box
                    component={motion.div}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Key size={16} />}
                      fullWidth
                      onClick={handleOpenDialog}
                      sx={{
                        py: 1.25,
                        borderColor: isLight ? '#E5E7EB' : '#262626',
                        color: 'text.primary',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: isLight ? '#4F46E5' : '#6366F1',
                          color: isLight ? '#4F46E5' : '#6366F1',
                          backgroundColor: isLight ? 'rgba(79, 70, 229, 0.04)' : 'rgba(99, 102, 241, 0.04)',
                        }
                      }}
                    >
                      Change Security Password
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Password Change Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown={isSubmitting}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Change Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Verify your current details and enter your new password below.
          </Typography>

          {error && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: isLight ? '#FEF2F2' : '#450A0A', border: '1px solid', borderColor: isLight ? '#FEE2E2' : '#7F1D1D', borderRadius: '6px' }}>
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSavePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              required
              fullWidth
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent(!showCurrent)} disabled={isSubmitting} edge="end">
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew(!showNew)} disabled={isSubmitting} edge="end">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} disabled={isSubmitting} edge="end">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            disabled={isSubmitting}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.secondary',
                backgroundColor: 'action.hover',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePassword}
            disabled={isSubmitting}
            sx={{
              backgroundColor: isLight ? '#4F46E5' : '#6366F1',
              color: '#FFFFFF',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: isLight ? '#4338CA' : '#4F46E5',
              }
            }}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default Settings;
