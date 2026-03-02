import React from 'react';
import { Calendar as CalendarIcon, MapPin, UserPlus, X } from 'lucide-react';

const EventRegistrationModal = ({
  selectedEvent,
  newAttendee,
  handleAttendeeInputChange,
  newGroupMember,
  setNewGroupMember,
  addGroupMember,
  removeGroupMember,
  formErrors,
  formatEventDates,
  onClose,
  onRegister,
}) => {
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
            Register for {selectedEvent.name}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#FAF5EF', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9B9590' }}>
            <CalendarIcon style={{ height: '16px', width: '16px', display: 'inline', marginRight: '6px' }} />
            {formatEventDates(selectedEvent)}
          </p>
          {selectedEvent.location && (
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#9B9590' }}>
              <MapPin style={{ height: '16px', width: '16px', display: 'inline', marginRight: '6px' }} />
              {selectedEvent.location}
            </p>
          )}
          <p
            style={{
              margin: '0',
              fontSize: '14px',
              fontWeight: 'bold',
              color: selectedEvent.registrationFee > 0 ? '#dc2626' : '#10b981',
            }}
          >
            {selectedEvent.registrationFee > 0
              ? `Registration Fee: $${selectedEvent.registrationFee} per person`
              : 'Free Event'}
          </p>
        </div>

        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Primary Registrant</h4>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Full Name *</label>
          <input
            type="text"
            value={newAttendee.primaryName}
            onChange={(e) => handleAttendeeInputChange('primaryName', e.target.value)}
            placeholder="Enter your full name"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${formErrors.primaryName ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
          {formErrors.primaryName && (
            <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{formErrors.primaryName}</p>
          )}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Email *</label>
          <input
            type="email"
            value={newAttendee.email}
            onChange={(e) => handleAttendeeInputChange('email', e.target.value)}
            placeholder="your@email.com"
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
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Phone (Optional)</label>
          <input
            type="tel"
            value={newAttendee.phone}
            onChange={(e) => handleAttendeeInputChange('phone', e.target.value)}
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

        {/* Group Members Section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Additional Registrants</h4>

          {newAttendee.groupMembers.map((member, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: '#FAF5EF',
                borderRadius: '4px',
              }}
            >
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 'bold' }}>{member.name}</span> ({member.relationship})
              </div>
              <button
                onClick={() => removeGroupMember(index)}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                <X style={{ height: '14px', width: '14px' }} />
              </button>
            </div>
          ))}

          <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={newGroupMember.name}
                onChange={(e) => setNewGroupMember((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
                style={{ flex: 1, padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              />
              <select
                value={newGroupMember.relationship}
                onChange={(e) => setNewGroupMember((prev) => ({ ...prev, relationship: e.target.value }))}
                style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              >
                <option value="">Relationship</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              onClick={addGroupMember}
              style={{
                backgroundColor: '#7B2D4E',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <UserPlus style={{ height: '14px', width: '14px', display: 'inline', marginRight: '4px' }} />
              Add Person
            </button>
          </div>
        </div>

        {/* Custom Questions */}
        {selectedEvent.customQuestions && selectedEvent.customQuestions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Additional Information</h4>
            {selectedEvent.customQuestions.map((question) => (
              <div key={question.id} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  {question.question} {question.required && '*'}
                </label>
                {question.type === 'text' && (
                  <input
                    type="text"
                    value={newAttendee.customResponses[question.id] || ''}
                    onChange={(e) =>
                      handleAttendeeInputChange('customResponses', {
                        ...newAttendee.customResponses,
                        [question.id]: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
                {question.type === 'yes/no' && (
                  <select
                    value={newAttendee.customResponses[question.id] || ''}
                    onChange={(e) =>
                      handleAttendeeInputChange('customResponses', {
                        ...newAttendee.customResponses,
                        [question.id]: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">-- Select --</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                )}
                {question.type === 'number' && (
                  <input
                    type="number"
                    value={newAttendee.customResponses[question.id] || ''}
                    onChange={(e) =>
                      handleAttendeeInputChange('customResponses', {
                        ...newAttendee.customResponses,
                        [question.id]: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
                {question.type === 'select' && question.options && (
                  <select
                    value={newAttendee.customResponses[question.id] || ''}
                    onChange={(e) =>
                      handleAttendeeInputChange('customResponses', {
                        ...newAttendee.customResponses,
                        [question.id]: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">-- Select --</option>
                    {question.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total Summary */}
        {(selectedEvent.registrationFee > 0 || newAttendee.groupMembers.length > 0) && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Registration Summary:</p>
            <p style={{ margin: '0', fontSize: '14px' }}>Total People: {1 + newAttendee.groupMembers.length}</p>
            {selectedEvent.registrationFee > 0 && (
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>
                Total Amount: ${selectedEvent.registrationFee * (1 + newAttendee.groupMembers.length)}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onRegister}
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
            {selectedEvent.registrationFee > 0
              ? `Register & Pay $${selectedEvent.registrationFee * (1 + newAttendee.groupMembers.length)}`
              : 'Register Now'}
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

export default EventRegistrationModal;
