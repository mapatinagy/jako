import { config } from '../config/config';

export const getApiUrl = (path: string): string => {
  return `${config.apiUrl}${path}`;
};

export const getFullImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${config.apiUrl}${imagePath}`;
}; 