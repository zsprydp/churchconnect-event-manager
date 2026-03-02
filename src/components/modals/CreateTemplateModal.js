import React from 'react';
import { X } from 'lucide-react';

const CreateTemplateModal = ({ newTemplate, setNewTemplate, onClose, onCreate, addNotification }) => {
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 id="modal-title" style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            Create New Email Template
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <X style={{ height: '20px', width: '20px', color: '#9B9590' }} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Template Name *</label>
          <input
            type="text"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Welcome Email, Event Reminder"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Template Type</label>
          <select
            value={newTemplate.type}
            onChange={(e) => setNewTemplate((prev) => ({ ...prev, type: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          >
            <option value="announcement">Announcement</option>
            <option value="reminder">Reminder</option>
            <option value="thank-you">Thank You</option>
            <option value="update">Update</option>
            <option value="welcome">Welcome</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Subject Line *</label>
          <input
            type="text"
            value={newTemplate.subject}
            onChange={(e) => setNewTemplate((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter email subject"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Message Content *</label>
          <textarea
            value={newTemplate.message}
            onChange={(e) => setNewTemplate((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Enter your email message. You can use variables like {name}, {event}, {date} etc."
            rows={8}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
          <p style={{ fontSize: '12px', color: '#9B9590', marginTop: '4px' }}>
            Available variables: {'{name}'}, {'{event}'}, {'{date}'}, {'{location}'}, {'{time}'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#F0E8DD',
              color: '#6B6560',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (newTemplate.name && newTemplate.subject && newTemplate.message) {
                onCreate();
              } else {
                addNotification('Please fill in all required fields', 'error');
              }
            }}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplateModal;
