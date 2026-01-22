/**
 * Get current timestamp in Asia/Jakarta timezone as ISO string
 * Returns: ISO string representing the current WIB time (e.g., "2026-01-22T17:30:00.000+07:00")
 * 
 * Note: This returns the actual WIB time, not UTC time.
 * When stored in database and read back, it should be interpreted as-is.
 */
export function getCurrentWIBISO(): string {
  // Get current time in WIB using Intl API
  const now = new Date();
  
  // Format to get WIB components
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');
  
  // Get milliseconds from original date
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  
  // Return ISO format with WIB timezone offset
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}+07:00`;
}

/**
 * Format date to Indonesia timezone (Asia/Jakarta)
 * Returns: Formatted date string (e.g., "22 Jan 2026, 17.24")
 */
export function formatDateToWIB(dateString: string): string {
  const date = new Date(dateString);
  
  // Format: "22 Jan 2026, 17.24"
  const day = date.toLocaleString('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' });
  const month = date.toLocaleString('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' });
  const year = date.toLocaleString('id-ID', { year: 'numeric', timeZone: 'Asia/Jakarta' });
  const hour = date.toLocaleString('id-ID', { hour: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' });
  const minute = date.toLocaleString('id-ID', { minute: '2-digit', timeZone: 'Asia/Jakarta' });
  
  return `${day} ${month} ${year}, ${hour}.${minute}`;
}
