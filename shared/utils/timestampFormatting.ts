/**
 * Timestamp Formatting Utilities
 * 
 * Utilities for formatting message timestamps
 */

/**
 * Format timestamp to readable string
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string
 */
export function formatMessageTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const date = new Date(timestamp);

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Today
  const today = new Date();
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return formatTime(timestamp);
  }

  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday at ${formatTime(timestamp)}`;
  }

  // This year
  if (date.getFullYear() === today.getFullYear()) {
    return formatDate(timestamp, false);
  }

  // Other years
  return formatDate(timestamp, true);
}

/**
 * Format time (HH:MM)
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format date
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @param includeYear - Include year in output
 * @returns Date string
 */
export function formatDate(timestamp: number, includeYear = true): string {
  const date = new Date(timestamp);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = formatTime(timestamp);

  if (includeYear) {
    const year = date.getFullYear();
    return `${month} ${day}, ${year} at ${time}`;
  }

  return `${month} ${day} at ${time}`;
}

/**
 * Format timestamp for conversation list
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Short formatted string
 */
export function formatConversationTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const date = new Date(timestamp);

  // Less than 1 minute
  if (diff < 60000) {
    return 'Now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d`;
  }

  // This year
  const today = new Date();
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Other years
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Group messages by date
 * 
 * @param messages - Array of messages with timestamps
 * @returns Grouped messages
 */
export function groupMessagesByDate<T extends { createdAt: number }>(
  messages: T[]
): { date: string; messages: T[] }[] {
  const groups = new Map<string, T[]>();

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const dateKey = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }

    groups.get(dateKey)!.push(message);
  });

  return Array.from(groups.entries()).map(([date, messages]) => ({
    date,
    messages
  }));
}

/**
 * Check if date is today
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if yesterday
 */
export function isYesterday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}
