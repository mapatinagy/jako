import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { getTimeLeft } from '../../utils/session';

const SessionTimer = () => {
  const [time, setTime] = useState('Munkamenet idő: 00:00:30');

  useEffect(() => {
    setTime(getTimeLeft());
    
    const interval = setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Typography variant="body2" sx={{ color: 'white' }}>
      {time}
    </Typography>
  );
};

export default SessionTimer; 