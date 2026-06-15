import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useThemeToggle = () => useContext(ThemeContext);

export const ThemeToggleProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('esrms_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('esrms_theme', next);
      return next;
    });
  };

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(mode);
  }, [mode]);

  const theme = useMemo(() => {
    const isLight = mode === 'light';
    
    // Mature SaaS colors (Accent Indigo #4F46E5, Neutral Grays, Clean Borders)
    const colors = {
      primary: isLight ? '#4F46E5' : '#6366F1',
      success: isLight ? '#16A34A' : '#22C55E',
      warning: '#F59E0B',
      error: isLight ? '#DC2626' : '#EF4444',
      background: {
        default: isLight ? '#F9FAFB' : '#09090B',
        paper: isLight ? '#FFFFFF' : '#1A1A1A',
      },
      text: {
        primary: isLight ? '#111827' : '#F3F4F6', // Standard primary text (dark in light, light in dark)
        secondary: isLight ? '#6B7280' : '#9CA3AF', // Standard secondary text
      },
      border: isLight ? '#ECECEC' : '#262626',
    };

    return createTheme({
      palette: {
        mode,
        primary: {
          main: colors.primary,
          contrastText: '#FFFFFF',
        },
        success: {
          main: colors.success,
          contrastText: '#FFFFFF',
        },
        warning: {
          main: colors.warning,
          contrastText: '#FFFFFF',
        },
        error: {
          main: colors.error,
          contrastText: '#FFFFFF',
        },
        background: colors.background,
        text: colors.text,
        divider: colors.border,
      },
      typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h5: { fontSize: '1.125rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        subtitle1: { fontSize: '0.9375rem', fontWeight: 500 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
        body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: colors.background.default,
              color: colors.text.primary,
              transition: 'background-color 0.15s ease, color 0.15s ease',
            },
          },
        },
        MuiButton: {
          defaultProps: {
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: 600,
              transition: 'all 0.15s ease-in-out',
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': {
                transform: 'none',
                boxShadow: 'none',
              },
            },
            containedPrimary: {
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              border: '1px solid transparent',
              '&:hover': {
                backgroundColor: isLight ? '#4338CA' : '#4F46E5',
              },
            },
            outlinedPrimary: {
              color: colors.primary,
              borderColor: isLight ? '#E2E8F0' : '#2D2D30',
              borderWidth: '1px',
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: 'rgba(79, 70, 229, 0.04)',
                borderWidth: '1px',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              boxShadow: 'none',
              backgroundImage: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            },
          },
        },
        MuiTableContainer: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              boxShadow: 'none',
              backgroundColor: colors.background.paper,
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              backgroundColor: isLight ? '#F9FAFB' : '#1A1A1A',
              borderBottom: `1px solid ${colors.border}`,
              '& .MuiTableCell-root': {
                fontWeight: 600,
                color: colors.text.secondary,
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              },
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.1s ease',
              '&:hover': {
                backgroundColor: isLight ? '#F9FAFB' : '#222225',
              },
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${colors.border}`,
              padding: '12px 16px',
              fontSize: '0.8125rem',
              color: colors.text.primary,
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
              backgroundImage: 'none',
              border: `1px solid ${colors.border}`,
            },
          },
        },
        MuiTextField: {
          defaultProps: {
            variant: 'outlined',
            size: 'small',
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: '6px',
              backgroundColor: isLight ? '#FFFFFF' : '#1F1F22',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1px',
                borderColor: colors.primary,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.75rem',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
