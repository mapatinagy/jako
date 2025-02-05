import { BehaviorSubject } from 'rxjs';

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

interface SessionState {
  timeLeft: number;
  isWarning: boolean;
}

const sessionSubject = new BehaviorSubject<SessionState>({
  timeLeft: SESSION_DURATION,
  isWarning: false
});

let sessionTimeout: NodeJS.Timeout;
let countdownInterval: NodeJS.Timeout;

export const formatTimeLeft = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const initSession = () => {
  // Clear any existing timers
  clearTimeout(sessionTimeout);
  clearInterval(countdownInterval);

  // Set initial state
  sessionSubject.next({
    timeLeft: SESSION_DURATION,
    isWarning: false
  });

  // Start countdown
  const startTime = Date.now();
  countdownInterval = setInterval(() => {
    const timeLeft = Math.max(0, SESSION_DURATION - (Date.now() - startTime));
    sessionSubject.next({
      timeLeft,
      isWarning: timeLeft <= WARNING_THRESHOLD
    });

    if (timeLeft === 0) {
      endSession();
    }
  }, 1000);

  // Set session timeout
  sessionTimeout = setTimeout(endSession, SESSION_DURATION);
};

export const refreshSession = () => {
  if (sessionSubject.value.timeLeft > 0) {
    initSession();
  }
};

export const endSession = () => {
  clearTimeout(sessionTimeout);
  clearInterval(countdownInterval);
  localStorage.removeItem('authToken');
  window.location.href = '/admin/login?expired=true';
};

// Activity tracking
let activityTimeout: NodeJS.Timeout;

const handleActivity = () => {
  clearTimeout(activityTimeout);
  activityTimeout = setTimeout(() => {
    refreshSession();
  }, 1000); // Debounce refresh calls
};

// Setup activity listeners
export const setupActivityTracking = () => {
  initSession(); // Start the initial session
  window.addEventListener('click', handleActivity);
};

export const cleanupActivityTracking = () => {
  window.removeEventListener('click', handleActivity);
  clearTimeout(activityTimeout);
  clearTimeout(sessionTimeout);
  clearInterval(countdownInterval);
};

export const getSessionObservable = () => sessionSubject.asObservable(); 