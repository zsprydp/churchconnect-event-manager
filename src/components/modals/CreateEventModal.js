import React from 'react';
import { X } from 'lucide-react';

const CreateEventModal = ({
  newEvent,
  handleEventInputChange,
  selectedTemplate,
  setSelectedTemplate,
  eventTemplates,
  applyEventTemplate,
  formErrors,
  newQuestion,
  setNewQuestion,
  addCustomQuestion,
  removeCustomQuestion,
  onClose,
  onCreate,
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
            Create New Event
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X style={{ height: '20px', width: '20px' }} />
          </button>
        </div>

        {/* Event Template Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Use Template (Optional)</label>
          <select
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value);
              if (e.target.value) applyEventTemplate(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          >
            <option value="">-- No Template --</option>
            {Object.entries(eventTemplates).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Event Name *</label>
          <input
            type="text"
            value={newEvent.name}
            onChange={(e) => handleEventInputChange('name', e.target.value)}
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
            value={newEvent.dateType}
            onChange={(e) => handleEventInputChange('dateType', e.target.value)}
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
        {newEvent.dateType === 'single' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Date</label>
            <input
              type="date"
              value={newEvent.dates[0]}
              onChange={(e) => handleEventInputChange('dates', [e.target.value])}
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

        {newEvent.dateType === 'multiple' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Dates</label>
            {newEvent.dates.map((date, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    const newDates = [...newEvent.dates];
                    newDates[index] = e.target.value;
                    handleEventInputChange('dates', newDates);
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
                      const newDates = newEvent.dates.filter((_, i) => i !== index);
                      handleEventInputChange('dates', newDates);
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
              onClick={() => handleEventInputChange('dates', [...newEvent.dates, ''])}
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

        {newEvent.dateType === 'recurring' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Recurrence Pattern</label>
            <input
              type="text"
              value={newEvent.recurrencePattern}
              onChange={(e) => handleEventInputChange('recurrencePattern', e.target.value)}
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
              value={newEvent.startTime}
              onChange={(e) => handleEventInputChange('startTime', e.target.value)}
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
              value={newEvent.endTime}
              onChange={(e) => handleEventInputChange('endTime', e.target.value)}
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
            value={newEvent.location}
            onChange={(e) => handleEventInputChange('location', e.target.value)}
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
            value={newEvent.capacity}
            onChange={(e) => handleEventInputChange('capacity', e.target.value)}
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
            value={newEvent.registrationFee}
            onChange={(e) => handleEventInputChange('registrationFee', e.target.value)}
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

        {/* Custom Questions Section */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Custom Questions</label>

          {newEvent.customQuestions.map((q) => (
            <div
              key={q.id}
              style={{ padding: '8px', backgroundColor: '#FAF5EF', borderRadius: '4px', marginBottom: '8px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>{q.question}</p>
                  <p style={{ margin: '0', fontSize: '12px', color: '#9B9590' }}>
                    Type: {q.type} • {q.required ? 'Required' : 'Optional'}
                  </p>
                </div>
                <button
                  onClick={() => removeCustomQuestion(q.id)}
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
            </div>
          ))}

          <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '12px' }}>
            <input
              type="text"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
              placeholder="Question text"
              style={{
                width: '100%',
                padding: '6px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '8px',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select
                value={newQuestion.type}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, type: e.target.value }))}
                style={{ flex: 1, padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              >
                <option value="text">Text</option>
                <option value="yes/no">Yes/No</option>
                <option value="number">Number</option>
                <option value="select">Multiple Choice</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="checkbox"
                  checked={newQuestion.required}
                  onChange={(e) => setNewQuestion((prev) => ({ ...prev, required: e.target.checked }))}
                />
                Required
              </label>
            </div>
            <button
              onClick={addCustomQuestion}
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
              Add Question
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCreate}
            style={{
              flex: 1,
              backgroundColor: '#7B2D4E',
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Create Event
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

export default CreateEventModal;
