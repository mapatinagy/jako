const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes
const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes

let sessionTimeout: NodeJS.Timeout;
let countdownInterval: NodeJS.Timeout;

// Update initial time display to show 10 minutes
const INITIAL_TIME = `Munkamenet idő: 00:10:00`;

export const formatTimeLeft = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `Munkamenet idő: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const initSession = () => {
  const endTime = Date.now() + SESSION_DURATION;
  localStorage.setItem('sessionExpiry', endTime.toString());
};

export const endSession = () => {
  clearTimeout(sessionTimeout);
  clearInterval(countdownInterval);
  localStorage.removeItem('authToken');
  localStorage.removeItem('sessionExpiry');
  window.location.href = '/admin/login?expired=true';
};

export const getTimeLeft = (): string => {
  const expiry = localStorage.getItem('sessionExpiry');
  if (!expiry) return INITIAL_TIME;
  
  const timeLeft = Math.max(0, parseInt(expiry) - Date.now());
  const isWarning = timeLeft <= WARNING_THRESHOLD;
  
  if (timeLeft === 0) {
    endSession();
  }
  
  return isWarning ? `⚠️ Munkamenet lejár: ${formatTimeLeft(timeLeft)}` : formatTimeLeft(timeLeft);
};

export const setupActivityTracking = () => {
  // Clear any existing timers
  clearTimeout(sessionTimeout);
  clearInterval(countdownInterval);
  
  // Initialize session
  initSession();
  
  // Add timeout for session end
  sessionTimeout = setTimeout(endSession, SESSION_DURATION);
  
  // Setup click handler
  const handleClick = () => {
    clearTimeout(sessionTimeout);
    initSession();
    sessionTimeout = setTimeout(endSession, SESSION_DURATION);
  };

  // Only track clicks
  document.addEventListener('click', handleClick);

  return () => {
    document.removeEventListener('click', handleClick);
    clearTimeout(sessionTimeout);
    clearInterval(countdownInterval);
  };
};

export const cleanupActivityTracking = () => {
  clearTimeout(sessionTimeout);
  clearInterval(countdownInterval);
}; 