/**
 * Simple utility function to add two numbers
 */
export const sum = (a: number, b: number): number => {
  return a + b;
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Generate a random string ID
 */
export const generateId = (length: number = 10): string => {
  return Math.random().toString(36).substring(2, length + 2);
};