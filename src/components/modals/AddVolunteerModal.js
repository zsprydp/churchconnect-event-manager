import React from 'react';
import { X } from 'lucide-react';

const AddVolunteerModal = ({ newVolunteer, handleVolunteerInputChange, formErrors, onClose, onAdd }) => {
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
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 id="modal-title" style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            Add New Volunteer
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
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Name *</label>
          <input
            type="text"
            value={newVolunteer.name}
            onChange={(e) => handleVolunteerInputChange('name', e.target.value)}
            placeholder="Volunteer's full name"
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
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Email *</label>
          <input
            type="email"
            value={newVolunteer.email}
            onChange={(e) => handleVolunteerInputChange('email', e.target.value)}
            placeholder="volunteer@email.com"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${formErrors.email ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.email && (
            <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{formErrors.email}</p>
          )}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Phone</label>
          <input
            type="tel"
            value={newVolunteer.phone}
            onChange={(e) => handleVolunteerInputChange('phone', e.target.value)}
            placeholder="555-0123"
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
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Role</label>
          <input
            type="text"
            value={newVolunteer.role}
            onChange={(e) => handleVolunteerInputChange('role', e.target.value)}
            placeholder="e.g., Event Coordinator, Setup Team, Registration"
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Security Level</label>
          <select
            value={newVolunteer.securityLevel}
            onChange={(e) => handleVolunteerInputChange('securityLevel', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          >
            <option value="volunteer">Volunteer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onAdd}
            style={{
              flex: 1,
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Add Volunteer
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: 'white',
              color: '#374151',
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

export default AddVolunteerModal;
