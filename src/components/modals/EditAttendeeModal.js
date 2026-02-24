import React from 'react';
import { X } from 'lucide-react';

const EditAttendeeModal = ({
  selectedAttendee,
  setSelectedAttendee,
  onClose,
  onUpdate
}) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Edit Attendee</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Name</label>
          <input 
            type="text" 
            value={selectedAttendee.primaryName} 
            onChange={(e) => setSelectedAttendee(prev => ({ ...prev, primaryName: e.target.value }))}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} 
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Email</label>
          <input 
            type="email" 
            value={selectedAttendee.email} 
            onChange={(e) => setSelectedAttendee(prev => ({ ...prev, email: e.target.value }))}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} 
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Phone</label>
          <input 
            type="tel" 
            value={selectedAttendee.phone} 
            onChange={(e) => setSelectedAttendee(prev => ({ ...prev, phone: e.target.value }))}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }} 
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Payment Status</label>
          <select 
            value={selectedAttendee.paymentStatus} 
            onChange={(e) => setSelectedAttendee(prev => ({ ...prev, paymentStatus: e.target.value }))}
            style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onUpdate} style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Update
          </button>
          <button onClick={onClose} style={{ flex: 1, backgroundColor: 'white', color: '#374151', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAttendeeModal;
