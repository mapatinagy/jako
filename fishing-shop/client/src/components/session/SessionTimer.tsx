import { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
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

  if (!timeLeft) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {isWarning ? (
        <Alert 
          severity="warning" 
          sx={{ 
            py: 0,
            '& .MuiAlert-message': { 
              display: 'flex', 
              alignItems: 'center' 
            } 
          }}
        >
          Session expires in: {formatTimeLeft(timeLeft)}
        </Alert>
      ) : (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.9
          }}
        >
          Session time: {formatTimeLeft(timeLeft)}
        </Typography>
      )}
    </Box>
  );
};

export default SessionTimer; 