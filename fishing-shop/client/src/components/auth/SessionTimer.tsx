import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getSessionObservable, formatTimeLeft } from '../../utils/session';

const SessionTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const subscription = getSessionObservable().subscribe(({ timeLeft, isWarning }) => {
      setTimeLeft(timeLeft);
      setIsWarning(isWarning);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        backgroundColor: isWarning ? 'rgba(211, 47, 47, 0.2)' : 'rgba(255, 255, 255, 0.1)',
        padding: '4px 12px',
        borderRadius: '16px',
      }}
    >
      <AccessTimeIcon sx={{ fontSize: '1rem', color: isWarning ? '#d32f2f' : 'inherit' }} />
      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: isWarning ? '#d32f2f' : 'inherit' }}>
        {formatTimeLeft(timeLeft)}
      </Typography>
    </Box>
  );
};

export default SessionTimer; 