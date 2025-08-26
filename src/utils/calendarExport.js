// Calendar Export Utilities for ChurchConnect
// Supports .ics file generation and quick-add links for popular calendar services

/**
 * Generate .ics file content for a single event
 * @param {Object} event - Event object with required properties
 * @returns {string} - .ics file content
 */
export function generateICSContent(event) {
  const {
    id,
    title,
    description = '',
    location = '',
    startDate,
    endDate,
    allDay = false,
    created = new Date(),
    lastModified = new Date()
  } = event;

  // Format dates for .ics
  const formatDate = (date) => {
    if (allDay) {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = new Date(startDate);
  const end = new Date(endDate);
  const createdDate = new Date(created);
  const modifiedDate = new Date(lastModified);

  // Generate unique identifier
  const uid = `${id}-${Date.now()}@churchconnect.com`;

  // Escape special characters in text fields
  const escapeText = (text) => {
    return text
      .replace(/[\\;,]/g, '\\$&')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChurchConnect//Event Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(createdDate)}`,
    `DTSTART:${allDay ? 'VALUE=DATE:' : ''}${formatDate(start)}`,
    `DTEND:${allDay ? 'VALUE=DATE:' : ''}${formatDate(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    `CREATED:${formatDate(createdDate)}`,
    `LAST-MODIFIED:${formatDate(modifiedDate)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Generate .ics file content for multiple events
 * @param {Array} events - Array of event objects
 * @returns {string} - .ics file content
 */
export function generateBulkICSContent(events) {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChurchConnect//Event Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const footer = ['END:VCALENDAR'];

  const eventBlocks = events.map(event => {
    const {
      id,
      title,
      description = '',
      location = '',
      startDate,
      endDate,
      allDay = false,
      created = new Date(),
      lastModified = new Date()
    } = event;

    const formatDate = (date) => {
      if (allDay) {
        return date.toISOString().slice(0, 10).replace(/-/g, '');
      }
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const createdDate = new Date(created);
    const modifiedDate = new Date(lastModified);
    const uid = `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@churchconnect.com`;

    const escapeText = (text) => {
      return text
        .replace(/[\\;,]/g, '\\$&')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
    };

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatDate(createdDate)}`,
      `DTSTART:${allDay ? 'VALUE=DATE:' : ''}${formatDate(start)}`,
      `DTEND:${allDay ? 'VALUE=DATE:' : ''}${formatDate(end)}`,
      `SUMMARY:${escapeText(title)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `LOCATION:${escapeText(location)}`,
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `CREATED:${formatDate(createdDate)}`,
      `LAST-MODIFIED:${formatDate(modifiedDate)}`,
      'END:VEVENT'
    ].join('\r\n');
  });

  return [...header, ...eventBlocks, ...footer].join('\r\n');
}

/**
 * Download .ics file
 * @param {string} content - .ics file content
 * @param {string} filename - Name of the file to download
 */
export function downloadICSFile(content, filename = 'event.ics') {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar quick-add link
 * @param {Object} event - Event object
 * @returns {string} - Google Calendar URL
 */
export function generateGoogleCalendarLink(event) {
  const {
    title,
    description = '',
    location = '',
    startDate,
    endDate,
    allDay = false
  } = event;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(start)}/${formatDate(end)}`,
    details: description,
    location: location,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook Calendar quick-add link
 * @param {Object} event - Event object
 * @returns {string} - Outlook Calendar URL
 */
export function generateOutlookCalendarLink(event) {
  const {
    title,
    description = '',
    location = '',
    startDate,
    endDate
  } = event;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date) => {
    return date.toISOString().split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    startdt: formatDate(start),
    enddt: formatDate(end),
    body: description,
    location: location
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Apple Calendar quick-add link
 * @param {Object} event - Event object
 * @returns {string} - Apple Calendar URL
 */
export function generateAppleCalendarLink(event) {
  const {
    title,
    description = '',
    location = '',
    startDate,
    endDate
  } = event;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatDate = (date) => {
    return date.toISOString().split('.')[0] + 'Z';
  };

  // Apple Calendar uses webcal:// protocol
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);

  return url;
}

/**
 * Get all calendar service links for an event
 * @param {Object} event - Event object
 * @returns {Object} - Object containing links for different calendar services
 */
export function getAllCalendarLinks(event) {
  return {
    google: generateGoogleCalendarLink(event),
    outlook: generateOutlookCalendarLink(event),
    apple: generateAppleCalendarLink(event),
    ics: generateICSContent(event)
  };
}

/**
 * Format event date for display
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time in the format
 * @returns {string} - Formatted date string
 */
export function formatEventDate(date, includeTime = true) {
  const eventDate = new Date(date);
  
  if (includeTime) {
    return eventDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Check if an event is happening today
 * @param {Date|string} eventDate - Event date to check
 * @returns {boolean} - True if event is today
 */
export function isEventToday(eventDate) {
  const today = new Date();
  const event = new Date(eventDate);
  
  return today.toDateString() === event.toDateString();
}

/**
 * Check if an event is happening this week
 * @param {Date|string} eventDate - Event date to check
 * @returns {boolean} - True if event is this week
 */
export function isEventThisWeek(eventDate) {
  const today = new Date();
  const event = new Date(eventDate);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return event >= startOfWeek && event <= endOfWeek;
}
