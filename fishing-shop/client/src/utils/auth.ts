interface DecodedToken {
  exp: number;
  userId: number;
  username: string;
}

export const isTokenValid = (token: string): boolean => {
  try {
    // Get the expiration part from the token (second part of JWT)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );

    const decoded = JSON.parse(jsonPayload) as DecodedToken;
    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  // Check if token is valid
  if (!isTokenValid(token)) {
    localStorage.removeItem('authToken');
    return null;
  }

  return token;
}; 