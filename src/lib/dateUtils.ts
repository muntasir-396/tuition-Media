export function formatTimeAgo(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return 'Recently';

  // If already formatted like "2 hours ago"
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (trimmed.includes('ago') || trimmed.toLowerCase() === 'just now') {
      return trimmed;
    }
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return 'Recently';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // If date is within the last 60 seconds (or slightly ahead due to clock skew)
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return '1 day ago';
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks === 1) {
    return '1 week ago';
  }
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) {
    return '1 month ago';
  }
  if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  if (diffInYears === 1) {
    return '1 year ago';
  }
  return `${diffInYears} years ago`;
}
