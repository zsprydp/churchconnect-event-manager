import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as LucideCalendar, Clock } from 'lucide-react';

const Calendar = ({ events = [], volunteers = [], attendees = [], onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // Navigate to specific year
  const goToYear = (year) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
  };
  
  // Get month name
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };
  
  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!events || !Array.isArray(events)) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (!event || !event.dates) return false;
      
      if (event.dateType === 'single') {
        return event.dates.includes(dateString);
      } else if (event.dateType === 'multiple') {
        return event.dates.includes(dateString);
      } else if (event.dateType === 'recurring') {
        // For recurring events, check if it's the right day of week/month
        // This is a simplified check - you can enhance this logic
        return false;
      }
      return false;
    });
  };
  
  // Get total registrants for an event
  const getTotalRegistrants = (eventId) => {
    if (!attendees || !Array.isArray(attendees)) return 0;
    
    const eventAttendees = attendees.filter(a => a && a.eventId === eventId);
    return eventAttendees.reduce((sum, a) => {
      if (!a || !a.groupMembers) return sum + 1;
      return sum + 1 + (a.groupMembers.length || 0);
    }, 0);
  };
  
  // Get active volunteers for an event
  const getActiveVolunteers = (eventId) => {
    if (!events || !Array.isArray(events)) return 0;
    
    const event = events.find(e => e && e.id === eventId);
    if (!event || !event.volunteers) return 0;
    return event.volunteers.length;
  };

  // Format event time for display
  const formatEventTime = (event) => {
    if (!event.time) return '';
    
    try {
      // Handle different time formats
      if (typeof event.time === 'string') {
        // If it's already a formatted time string
        if (event.time.includes(':')) {
          return event.time;
        }
        // If it's a timestamp
        const time = new Date(event.time);
        if (!isNaN(time.getTime())) {
          return time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        }
      }
      
      // If it's a Date object
      if (event.time instanceof Date) {
        return event.time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting event time:', error);
      return '';
    }
  };

  // Handle event click
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  // Generate calendar grid
  const generateCalendarGrid = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const grid = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      grid.push({ day: null, events: [] });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      grid.push({ day, date, events });
    }
    
    return grid;
  };
  
  // Add safety check for props
  if (!events || !volunteers || !attendees) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Event Calendar</h3>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>Loading calendar data...</p>
      </div>
    );
  }
  
  const calendarGrid = generateCalendarGrid();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Event Calendar</h3>
        
        {/* Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Year Selector */}
          <select 
            value={currentDate.getFullYear()}
            onChange={(e) => goToYear(parseInt(e.target.value))}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            {Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          {/* Month Navigation */}
          <button
            onClick={goToPreviousMonth}
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronLeft style={{ height: '16px', width: '16px' }} />
          </button>
          
          <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '120px', textAlign: 'center' }}>
            {getMonthName(currentDate)}
          </span>
          
          <button
            onClick={goToNextMonth}
            style={{
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '4px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronRight style={{ height: '16px', width: '16px' }} />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#e5e7eb' }}>
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} style={{
            backgroundColor: '#f9fafb',
            padding: '8px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#6b7280'
          }}>
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarGrid.map((cell, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            minHeight: '80px',
            padding: '4px',
            border: '1px solid #f3f4f6',
            position: 'relative'
          }}>
            {cell.day && (
              <>
                {/* Day number */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  {cell.day}
                </div>
                
                {/* Events */}
                {cell.events.map((event, eventIndex) => (
                  <div 
                    key={event.id} 
                    onClick={(e) => handleEventClick(event, e)}
                    style={{
                      backgroundColor: '#dbeafe',
                      border: '1px solid #3b82f6',
                      borderRadius: '4px',
                      padding: '4px',
                      marginBottom: '2px',
                      fontSize: '10px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#bfdbfe';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#dbeafe';
                      e.target.style.transform = 'scale(1)';
                    }}
                    title={`Click to view ${event.name}`}
                  >
                    <div style={{ fontWeight: 'bold', color: '#1d4ed8', marginBottom: '2px' }}>
                      {event.name}
                    </div>
                    
                    {/* Event Time - Between Name and Metrics */}
                    {event.startTime && event.endTime && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginBottom: '2px',
                        fontSize: '8px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}>
                        <Clock style={{ height: '8px', width: '8px' }} />
                        {event.startTime}-{event.endTime}
                      </div>
                    )}
                    
                    {/* Metrics */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}>
                      <span style={{ color: '#8b5cf6' }}>
                        {getActiveVolunteers(event.id)} vol
                      </span>
                      <span style={{ color: '#10b981' }}>
                        {getTotalRegistrants(event.id)} reg
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '2px' }}></div>
          <span>Events</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#8b5cf6' }}>vol</span>
          <span>= Active Volunteers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#10b981' }}>reg</span>
          <span>= Total Registrants</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
