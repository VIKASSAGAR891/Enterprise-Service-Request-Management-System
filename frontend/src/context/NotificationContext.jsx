import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle, Slide } from '@mui/material';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext({
  showNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

function TransitionLeft(props) {
  return <Slide {...props} direction="left" />;
}

export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info'); // 'success' | 'error' | 'warning' | 'info'
  const [title, setTitle] = useState('');

  const showNotification = useCallback((msg, sev = 'info', t = '') => {
    setMessage(msg);
    setSeverity(sev);
    setTitle(t);
    setOpen(true);
  }, []);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getIcon = () => {
    const iconStyle = { marginRight: '8px', width: '20px', height: '20px' };
    switch (severity) {
      case 'success':
        return <CheckCircle2 style={iconStyle} />;
      case 'warning':
        return <AlertTriangle style={iconStyle} />;
      case 'error':
        return <AlertCircle style={iconStyle} />;
      case 'info':
      default:
        return <Info style={iconStyle} />;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={TransitionLeft}
        sx={{ mt: 7 }} // push below header
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          icon={getIcon()}
          sx={{
            width: '100%',
            minWidth: '300px',
            maxWidth: '450px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${
              severity === 'success' ? '#16A34A' :
              severity === 'error' ? '#DC2626' :
              severity === 'warning' ? '#F59E0B' : '#8B80F9'
            }40`,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          {title && <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>}
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
