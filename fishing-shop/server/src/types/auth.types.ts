export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
} 