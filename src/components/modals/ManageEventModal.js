import React from 'react';
import { Calendar as CalendarIcon, MapPin, X, Check, CheckCircle, User } from 'lucide-react';

const ManageEventModal = ({
  selectedEvent,
  manageEventTab,
  setManageEventTab,
  volunteers,
  toggleVolunteerAssignment,
  toggleAttendeeCheckIn,
  getEventAttendees,
  getTotalPeopleCount,
  formatEventDates,
  onClose
}) => {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 id="modal-title" style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Manage: {selectedEvent.name}</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>
            <CalendarIcon style={{ height: '16px', width: '16px', display: 'inline', marginRight: '6px' }} />
            {formatEventDates(selectedEvent)}
          </p>
          {selectedEvent.location && (
            <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
              <MapPin style={{ height: '16px', width: '16px', display: 'inline', marginRight: '6px' }} />
              {selectedEvent.location}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => setManageEventTab('volunteers')}
            style={{
              padding: '8px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
              borderBottom: manageEventTab === 'volunteers' ? '2px solid #3b82f6' : 'none',
              color: manageEventTab === 'volunteers' ? '#3b82f6' : '#6b7280', fontWeight: 'bold'
            }}
          >
            Volunteers ({selectedEvent.volunteers.length})
          </button>
          <button
            onClick={() => setManageEventTab('attendees')}
            style={{
              padding: '8px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
              borderBottom: manageEventTab === 'attendees' ? '2px solid #3b82f6' : 'none',
              color: manageEventTab === 'attendees' ? '#3b82f6' : '#6b7280', fontWeight: 'bold'
            }}
          >
            Attendees ({getTotalPeopleCount(selectedEvent.id)})
          </button>
        </div>

        {manageEventTab === 'volunteers' && (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Assign Volunteers</h4>
            {volunteers.map(volunteer => {
              const isAssigned = selectedEvent.volunteers.includes(volunteer.id);
              return (
                <div key={volunteer.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginBottom: '8px',
                  backgroundColor: isAssigned ? '#f0f9ff' : '#f9fafb', borderRadius: '8px',
                  border: isAssigned ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                }}>
                  <div>
                    <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{volunteer.name}</p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>{volunteer.role} • {volunteer.email}</p>
                  </div>
                  <button onClick={() => toggleVolunteerAssignment(volunteer.id)} style={{
                    backgroundColor: isAssigned ? '#dc2626' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px',
                    padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    {isAssigned ? (<><X style={{ height: '12px', width: '12px' }} />Remove</>) : (<><Check style={{ height: '12px', width: '12px' }} />Assign</>)}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {manageEventTab === 'attendees' && (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Event Attendees</h4>
            {getEventAttendees(selectedEvent.id).map(attendee => (
              <div key={attendee.id} style={{
                padding: '12px', marginBottom: '8px',
                backgroundColor: attendee.checkedIn ? '#f0f9ff' : '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ margin: '0', fontWeight: 'bold' }}>{attendee.primaryName}</p>
                      {attendee.checkedIn && <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />}
                    </div>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>{attendee.email}</p>
                    
                    {attendee.groupMembers.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                        +{attendee.groupMembers.length} additional: {attendee.groupMembers.map(m => m.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleAttendeeCheckIn(attendee.id)} style={{
                    backgroundColor: attendee.checkedIn ? '#dc2626' : '#10b981', color: 'white', border: 'none', borderRadius: '6px',
                    padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {attendee.checkedIn ? 'Check Out' : 'Check In'}
                  </button>
                </div>
              </div>
            ))}
            
            {getEventAttendees(selectedEvent.id).length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                <User style={{ height: '32px', width: '32px', margin: '0 auto 8px' }} />
                <p>No attendees registered yet</p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={onClose} style={{
            backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageEventModal;
