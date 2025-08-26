import React, { useState } from 'react';
import { Calendar, Download, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import {
  generateICSContent,
  generateBulkICSContent,
  downloadICSFile,
  generateGoogleCalendarLink,
  generateOutlookCalendarLink,
  generateAppleCalendarLink,
  getAllCalendarLinks
} from '../utils/calendarExport';
import './CalendarExport.css';

const CalendarExport = ({ event, events = [], showBulkExport = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState(null);

  const handleSingleEventExport = () => {
    if (!event) {
      console.error('No event provided for export');
      return;
    }
    
    console.log('Exporting single event:', event);
    
    try {
      const icsContent = generateICSContent(event);
      const filename = `${event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      downloadICSFile(icsContent, filename);
      console.log('ICS file downloaded successfully');
    } catch (error) {
      console.error('Failed to export event:', error);
      alert('Failed to export event. Please check the console for details.');
    }
  };

  const handleBulkExport = () => {
    if (!events || events.length === 0) {
      console.error('No events provided for bulk export');
      return;
    }
    
    console.log('Exporting bulk events:', events);
    
    try {
      const icsContent = generateBulkICSContent(events);
      const filename = `churchconnect_events_${new Date().toISOString().slice(0, 10)}.ics`;
      downloadICSFile(icsContent, filename);
      console.log('Bulk ICS file downloaded successfully');
    } catch (error) {
      console.error('Failed to export bulk events:', error);
      alert('Failed to export events. Please check the console for details.');
    }
  };

  const handleCalendarServiceClick = (service, eventData) => {
    console.log(`Opening ${service} calendar for event:`, eventData);
    
    let url;
    
    try {
      switch (service) {
        case 'google':
          url = generateGoogleCalendarLink(eventData);
          break;
        case 'outlook':
          url = generateOutlookCalendarLink(eventData);
          break;
        case 'apple':
          url = generateAppleCalendarLink(eventData);
          break;
        default:
          console.error('Unknown calendar service:', service);
          return;
      }
      
      console.log(`${service} calendar URL:`, url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error(`Failed to generate ${service} calendar link:`, error);
      alert(`Failed to open ${service} calendar. Please check the console for details.`);
    }
  };

  const getCalendarServiceIcon = (service) => {
    switch (service) {
      case 'google':
        return '📅';
      case 'outlook':
        return '📧';
      case 'apple':
        return '🍎';
      default:
        return '📅';
    }
  };

  const getCalendarServiceName = (service) => {
    switch (service) {
      case 'google':
        return 'Google Calendar';
      case 'outlook':
        return 'Outlook Calendar';
      case 'apple':
        return 'Apple Calendar';
      default:
        return 'Calendar';
    }
  };

  const getCalendarServiceColor = (service) => {
    switch (service) {
      case 'google':
        return '#4285f4';
      case 'outlook':
        return '#0078d4';
      case 'apple':
        return '#000000';
      default:
        return '#666666';
    }
  };

  // Debug logging
  React.useEffect(() => {
    if (event) {
      console.log('CalendarExport component received event:', event);
    }
    if (events && events.length > 0) {
      console.log('CalendarExport component received events:', events);
    }
  }, [event, events]);

  if (!event && (!events || events.length === 0)) {
    console.log('CalendarExport: No event or events provided');
    return null;
  }

  return (
    <div className="calendar-export">
      <div className="calendar-export-header">
        <Calendar size={20} />
        <span>Add to Calendar</span>
        <button
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse calendar options' : 'Expand calendar options'}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="calendar-export-content">
          {/* Single Event Export */}
          {event && (
            <div className="export-section">
              <h4>Export Single Event</h4>
              <div className="export-options">
                <button
                  className="export-btn primary"
                  onClick={handleSingleEventExport}
                >
                  <Download size={16} />
                  Download .ics File
                </button>
                
                <div className="calendar-services">
                  <span>Quick Add to:</span>
                  <div className="service-buttons">
                    {['google', 'outlook', 'apple'].map(service => (
                      <button
                        key={service}
                        className="service-btn"
                        onClick={() => handleCalendarServiceClick(service, event)}
                        style={{ '--service-color': getCalendarServiceColor(service) }}
                      >
                        <span className="service-icon">{getCalendarServiceIcon(service)}</span>
                        <span className="service-name">{getCalendarServiceName(service)}</span>
                        <ExternalLink size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Export */}
          {showBulkExport && events && events.length > 0 && (
            <div className="export-section">
              <h4>Export All Events</h4>
              <div className="export-options">
                <button
                  className="export-btn secondary"
                  onClick={handleBulkExport}
                >
                  <Download size={16} />
                  Download All Events (.ics)
                </button>
                <span className="event-count">
                  {events.length} event{events.length !== 1 ? 's' : ''} included
                </span>
              </div>
            </div>
          )}

          {/* Calendar Service Information */}
          <div className="calendar-info">
            <h4>Supported Calendar Services</h4>
            <div className="service-info">
              <div className="service-item">
                <span className="service-icon">📅</span>
                <div>
                  <strong>Google Calendar</strong>
                  <p>Add events directly to your Google Calendar</p>
                </div>
              </div>
              <div className="service-item">
                <span className="service-icon">📧</span>
                <div>
                  <strong>Outlook Calendar</strong>
                  <p>Quick add to Microsoft Outlook</p>
                </div>
              </div>
              <div className="service-item">
                <span className="service-icon">🍎</span>
                <div>
                  <strong>Apple Calendar</strong>
                  <p>Download .ics file for Apple Calendar</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="help-text">
            <p>
              <strong>Tip:</strong> Use the .ics file to import events into any calendar application.
              Most calendar apps support this standard format.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarExport;
