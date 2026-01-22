/**
 * Utility functions for name formatting and parsing
 */

/**
 * Extract the first name from a full name string
 * Splits by space and returns the first word
 * @param fullName - The full name (e.g., "Alvin Al Munawwar")
 * @returns The first name (e.g., "Alvin") or the original if single word
 */
export const getFirstName = (fullName: string): string => {
  if (!fullName) return '';
  
  const trimmedName = fullName.trim();
  const names = trimmedName.split(' ');
  
  // Return first name, or the original string if only one word
  return names[0] || fullName;
};
