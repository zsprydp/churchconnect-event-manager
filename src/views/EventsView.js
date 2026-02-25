import React from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Bell, X, Edit2, Archive, Clock, Trash2, Search } from 'lucide-react';
import CalendarExport from '../components/CalendarExport';

const EventsView = ({
  showArchivedEvents,
  setShowArchivedEvents,
  setShowCreateEvent,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  events,
  setEvents,
  filterEvents,
  getTotalPeopleCount,
  formatEventDates,
  handleManageEvent,
  handleEditEvent,
  handleRegisterForEvent,
  handleEventStatusChange,
  handleDeleteEvent,
  volunteers,
  communications,
  sendVolunteerReminders,
  addNotification
}) => {
  return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Events</h2>
                <button
                  onClick={() => setShowArchivedEvents(!showArchivedEvents)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Archive style={{ height: '14px', width: '14px' }} />
                  {showArchivedEvents ? 'Hide' : 'Show'} Archived ({events.filter(e => e.status === 'archived').length})
                </button>
                {events.filter(e => e.status === 'closed').length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Archive all ${events.filter(e => e.status === 'closed').length} closed events?`)) {
                        setEvents(prev => prev.map(event => 
                          event.status === 'closed' ? { ...event, status: 'archived' } : event
                        ));
                      }
                    }}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Archive All Closed
                  </button>
                )}
              </div>
              <button 
                onClick={() => setShowCreateEvent(true)}
                style={{ 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  padding: '10px 16px', 
                  borderRadius: '6px', 
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold'
                }}
              >
                <Plus style={{ height: '16px', width: '16px' }} />
                Create Event
              </button>
            </div>

            {/* Search and Filter Section */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Search events by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">All Events</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Bulk Calendar Export */}
            <div style={{ marginBottom: '20px' }}>
              <CalendarExport 
                events={events.filter(e => e.status !== 'archived')} 
                showBulkExport={true}
                onNotification={addNotification}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              {filterEvents(events, searchTerm, filterStatus)
                .filter(e => showArchivedEvents || e.status !== 'archived')
                .map(event => {
                const eventVolunteers = volunteers.filter(v => event.volunteers.includes(v.id));
                const totalPeople = getTotalPeopleCount(event.id);
                const spotsLeft = event.capacity - totalPeople;
                
                return (
                  <div key={event.id} style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    opacity: event.status === 'archived' ? 0.7 : 1
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{event.name}</h3>
                        {event.status !== 'active' && (
                          <span style={{
                            backgroundColor: event.status === 'closed' ? '#fef3c7' : '#f3f4f6',
                            color: event.status === 'closed' ? '#d97706' : '#6b7280',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}>
                            {event.status}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <CalendarIcon style={{ height: '16px', width: '16px', marginRight: '6px', color: '#6b7280' }} />
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {formatEventDates(event)}
                        </span>
                      </div>
                      {event.startTime && event.endTime && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                          <Clock style={{ height: '16px', width: '16px', marginRight: '6px', color: '#6b7280' }} />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <MapPin style={{ height: '16px', width: '16px', marginRight: '6px', color: '#6b7280' }} />
                          <span style={{ fontSize: '14px', color: '#6b7280' }}>{event.location}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#3b82f6' }}>
                          {totalPeople}/{event.capacity}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Registered</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#8b5cf6' }}>
                          {eventVolunteers.length}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Volunteers</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#10b981' }}>
                          ${event.registrationFee}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Fee</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#f59e0b' }}>
                          {communications.filter(c => c.recipients.includes(event.name) || c.recipients === 'All Events').length}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Messages</p>
                      </div>
                    </div>

                    {/* Calendar Export Component */}
                    <div style={{ marginBottom: '16px' }}>
                      <CalendarExport event={event} onNotification={addNotification} />
                    </div>

                    {event.status === 'active' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleManageEvent(event)}
                          style={{
                            flex: 1,
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                        >
                          Manage
                        </button>
                        <button 
                          onClick={() => handleEditEvent(event)}
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                          title="Edit Event"
                        >
                          <Edit2 style={{ height: '14px', width: '14px' }} />
                        </button>
                        {event.volunteers.length > 0 && (
                          <button 
                            onClick={() => sendVolunteerReminders(event.id)}
                            style={{
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '8px',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                            title="Send volunteer reminders"
                          >
                            <Bell style={{ height: '14px', width: '14px' }} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleRegisterForEvent(event)}
                          disabled={spotsLeft <= 0}
                          style={{
                            flex: 1,
                            backgroundColor: spotsLeft <= 0 ? '#9ca3af' : '#10b981',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: spotsLeft <= 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                        >
                          {spotsLeft <= 0 ? 'Full' : 'Register'}
                        </button>
                        <button 
                          onClick={() => handleEventStatusChange(event.id, 'closed')}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          title="Close Event"
                        >
                          <X style={{ height: '16px', width: '16px' }} />
                        </button>
                      </div>
                    )}

                    {event.status === 'closed' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEventStatusChange(event.id, 'active')}
                          style={{
                            flex: 1,
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                        >
                          Reopen
                        </button>
                        <button 
                          onClick={() => handleEventStatusChange(event.id, 'archived')}
                          style={{
                            flex: 1,
                            backgroundColor: '#6b7280',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                        >
                          Archive
                        </button>
                      </div>
                    )}

                    {event.status === 'archived' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEventStatusChange(event.id, 'active')}
                          style={{
                            flex: 1,
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                        >
                          Reactivate
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            flex: 1,
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}
                        >
                          <Trash2 style={{ height: '16px', width: '16px', display: 'inline', marginRight: '4px' }} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
  );
};

export default EventsView;
