import React from 'react';
import { X, Send } from 'lucide-react';

const SendMessageModal = ({
  newMessage,
  handleMessageInputChange,
  volunteers,
  attendees,
  events,
  onClose,
  onSend
}) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Send Message</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Message Type</label>
            <select value={newMessage.type} onChange={(e) => handleMessageInputChange('type', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}>
              <option value="announcement">Announcement</option>
              <option value="reminder">Reminder</option>
              <option value="update">Update</option>
              <option value="thank-you">Thank You</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Send Via</label>
            <select value={newMessage.sendVia} onChange={(e) => handleMessageInputChange('sendVia', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Recipients</label>
          <select value={newMessage.recipients} onChange={(e) => handleMessageInputChange('recipients', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}>
            <option value="all-volunteers">All Volunteers ({volunteers.length})</option>
            <option value="all-attendees">All Attendees ({attendees.length})</option>
            <option value="event-volunteers">Event Volunteers</option>
            <option value="event-attendees">Event Attendees</option>
          </select>
        </div>

        {(newMessage.recipients === 'event-volunteers' || newMessage.recipients === 'event-attendees') && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Select Event</label>
            <select value={newMessage.eventId} onChange={(e) => handleMessageInputChange('eventId', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}>
              <option value="">Choose an event...</option>
              {events.filter(e => e.status === 'active').map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Subject *</label>
          <input type="text" value={newMessage.subject} onChange={(e) => handleMessageInputChange('subject', e.target.value)} placeholder="Enter subject line"
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Message *</label>
          <textarea rows={6} value={newMessage.message} onChange={(e) => handleMessageInputChange('message', e.target.value)} placeholder="Write your message..."
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onSend} 
            data-send-button
            style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Send style={{ height: '16px', width: '16px' }} />
            Send Message
          </button>
          <button onClick={onClose} style={{ flex: 1, backgroundColor: 'white', color: '#374151', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
