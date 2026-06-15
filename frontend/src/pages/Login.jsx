import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../context/ThemeContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import loginBg from '../assets/LOGIN.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { mode, toggleTheme } = useThemeToggle();
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      setSubmitting(false);

      const role = loggedUser.role ? loggedUser.role.toUpperCase() : '';
      if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (role === 'AGENT' || role === 'TEAM_LEAD') {
        navigate('/agent-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      setSubmitting(false);
      if (err.response && err.response.status === 401) {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        setError('Server connection failed. Ensure the Spring Boot backend is active.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', sm: 'flex-start' },
        pl: { xs: 0, sm: 6, md: 12, lg: 16 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Full screen Background Image */}
      <Box
        component="img"
        src={loginBg}
        alt="Login Background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />

      {/* Dark overlay mask for image readability */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 2,
        }}
      />

      {/* Floating Theme Switcher at top right corner of the screen */}
      <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            bgcolor: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(38, 38, 38, 0.85)',
            border: '1px solid',
            borderColor: mode === 'light' ? '#E5E7EB' : '#262626',
            color: mode === 'light' ? '#374151' : '#F3F4F6',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            p: 1.25,
            '&:hover': {
              bgcolor: mode === 'light' ? '#F3F4F6' : '#262626',
              transform: 'scale(1.05)',
            }
          }}
        >
          {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>
      </Box>

      {/* Login Card overlayed on the left */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          px: { xs: 2, sm: 0 },
          zIndex: 3,
          position: 'relative',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid',
              borderColor: mode === 'light' ? 'rgba(229, 231, 235, 0.5)' : 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.75)',
              boxShadow: mode === 'light'
                ? '0 10px 30px -10px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.05)'
                : '0 20px 40px -20px rgba(0,0,0,0.7), 0 1px 5px rgba(0,0,0,0.4)',
            }}
          >
            <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
              {/* Header Logo & Title */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Box
                  component={motion.div}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  sx={{
                    bgcolor: mode === 'light' ? '#4F46E5' : '#6366F1',
                    color: '#FFFFFF',
                    p: 1.5,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: mode === 'light'
                      ? '0 4px 12px rgba(79, 70, 229, 0.2)'
                      : '0 4px 16px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <ShieldCheck size={28} />
                </Box>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}
                >
                  Welcome back
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ px: 1 }}>
                  Enterprise Service Request Management System
                </Typography>
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 3,
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      border: '1px solid',
                      borderColor: mode === 'light' ? '#FEE2E2' : '#7F1D1D',
                      bgcolor: mode === 'light' ? '#FEF2F2' : '#450A0A',
                      color: mode === 'light' ? '#EF4444' : '#FCA5A5',
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Form Input fields */}
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, color: 'text.primary', fontSize: '0.8125rem' }}>
                    Email Address
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} style={{ color: mode === 'light' ? '#9CA3AF' : '#6B7280' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 42,
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8125rem' }}>
                      Password
                    </Typography>
                    <Link
                      href="#"
                      variant="body2"
                      onClick={(e) => e.preventDefault()}
                      sx={{
                        fontWeight: 600,
                        textDecoration: 'none',
                        color: mode === 'light' ? '#4F46E5' : '#6366F1',
                        fontSize: '0.75rem',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} style={{ color: mode === 'light' ? '#9CA3AF' : '#6B7280' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleTogglePassword} edge="end" sx={{ color: mode === 'light' ? '#9CA3AF' : '#6B7280', p: 0.5 }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 42,
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>

                {/* Keep me logged in */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          p: 0.5,
                          mr: 0.5,
                          color: mode === 'light' ? '#D1D5DB' : '#4B5563',
                          '&.Mui-checked': {
                            color: mode === 'light' ? '#4F46E5' : '#6366F1',
                          },
                          '& .MuiSvgIcon-root': { fontSize: 20 }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: 'text.secondary', userSelect: 'none', fontSize: '0.75rem' }}>
                        Keep me logged in
                      </Typography>
                    }
                  />
                </Box>

                <Box
                  component={motion.div}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={submitting}
                    sx={{
                      height: 42,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      backgroundColor: mode === 'light' ? '#4F46E5' : '#6366F1',
                      boxShadow: mode === 'light'
                        ? '0 4px 12px rgba(79, 70, 229, 0.15)'
                        : '0 4px 20px rgba(99, 102, 241, 0.25)',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: mode === 'light' ? '#4338CA' : '#4F46E5',
                        boxShadow: mode === 'light'
                          ? '0 6px 16px rgba(79, 70, 229, 0.25)'
                          : '0 6px 24px rgba(99, 102, 241, 0.35)',
                      },
                      '&:disabled': {
                        backgroundColor: mode === 'light' ? '#E5E7EB' : '#262626',
                        color: mode === 'light' ? '#9CA3AF' : '#4B5563',
                      }
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Login;

