import React from 'react';
import { X } from 'lucide-react';

const EditEventModal = ({ editingEvent, setEditingEvent, formErrors, onClose, onUpdate }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 id="modal-title" style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            Edit Event: {editingEvent.name}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Event Name *</label>
          <input
            type="text"
            value={editingEvent.name}
            onChange={(e) => setEditingEvent((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter event name"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${formErrors.name ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.name && (
            <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{formErrors.name}</p>
          )}
        </div>

        {/* Date Type Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Date Type</label>
          <select
            value={editingEvent.dateType}
            onChange={(e) => setEditingEvent((prev) => ({ ...prev, dateType: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          >
            <option value="single">Single Date</option>
            <option value="multiple">Multiple Dates</option>
            <option value="recurring">Recurring</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>

        {/* Date Input Based on Type */}
        {editingEvent.dateType === 'single' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Date</label>
            <input
              type="date"
              value={editingEvent.dates[0] || ''}
              onChange={(e) => setEditingEvent((prev) => ({ ...prev, dates: [e.target.value] }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {editingEvent.dateType === 'multiple' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Dates</label>
            {editingEvent.dates.map((date, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    const newDates = [...editingEvent.dates];
                    newDates[index] = e.target.value;
                    setEditingEvent((prev) => ({ ...prev, dates: newDates }));
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
                {index > 0 && (
                  <button
                    onClick={() => {
                      const newDates = editingEvent.dates.filter((_, i) => i !== index);
                      setEditingEvent((prev) => ({ ...prev, dates: newDates }));
                    }}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <X style={{ height: '16px', width: '16px' }} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setEditingEvent((prev) => ({ ...prev, dates: [...prev.dates, ''] }))}
              style={{
                backgroundColor: '#7B2D4E',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Add Date
            </button>
          </div>
        )}

        {editingEvent.dateType === 'recurring' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Recurrence Pattern</label>
            <input
              type="text"
              value={editingEvent.recurrencePattern || ''}
              onChange={(e) => setEditingEvent((prev) => ({ ...prev, recurrencePattern: e.target.value }))}
              placeholder="e.g., Every 4th Tuesday of the month"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Time Range Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Start Time</label>
            <input
              type="time"
              value={editingEvent.startTime || '09:00'}
              onChange={(e) => setEditingEvent((prev) => ({ ...prev, startTime: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>End Time</label>
            <input
              type="time"
              value={editingEvent.endTime || '17:00'}
              onChange={(e) => setEditingEvent((prev) => ({ ...prev, endTime: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Location (Optional)</label>
          <input
            type="text"
            value={editingEvent.location || ''}
            onChange={(e) => setEditingEvent((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="Event location"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Capacity</label>
          <input
            type="number"
            value={editingEvent.capacity || ''}
            onChange={(e) => setEditingEvent((prev) => ({ ...prev, capacity: e.target.value }))}
            placeholder="Maximum attendees"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${formErrors.capacity ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.capacity && (
            <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{formErrors.capacity}</p>
          )}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Registration Fee ($)</label>
          <input
            type="number"
            step="0.01"
            value={editingEvent.registrationFee || ''}
            onChange={(e) => setEditingEvent((prev) => ({ ...prev, registrationFee: e.target.value }))}
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${formErrors.registrationFee ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.registrationFee && (
            <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{formErrors.registrationFee}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onUpdate}
            style={{
              flex: 1,
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Update Event
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: 'white',
              color: '#6B6560',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
