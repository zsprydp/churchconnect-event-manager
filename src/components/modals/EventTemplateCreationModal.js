import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const EventTemplateCreationModal = ({ newEventTemplate, setNewEventTemplate, onClose, onCreate, addNotification }) => {
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
            Create New Event Template
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
            <X style={{ height: '20px', width: '20px', color: '#6b7280' }} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Template Name *</label>
          <input
            type="text"
            value={newEventTemplate.name}
            onChange={(e) => setNewEventTemplate((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Community Dinner, Youth Retreat"
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
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Event Type *</label>
          <select
            value={newEventTemplate.eventType}
            onChange={(e) => setNewEventTemplate((prev) => ({ ...prev, eventType: e.target.value }))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Select Event Type</option>
            <option value="dinner">Community Dinner</option>
            <option value="feast">Feast Celebration</option>
            <option value="retreat">Spiritual Retreat</option>
            <option value="service">Worship Service</option>
            <option value="workshop">Workshop</option>
            <option value="meeting">Meeting</option>
            <option value="social">Social Event</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Custom Questions</label>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Add custom questions that attendees will answer when registering for events using this template.
          </p>

          {newEventTemplate.customQuestions.map((question, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#f9fafb',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => {
                    const updatedQuestions = [...newEventTemplate.customQuestions];
                    updatedQuestions[index].question = e.target.value;
                    setNewEventTemplate((prev) => ({ ...prev, customQuestions: updatedQuestions }));
                  }}
                  placeholder="Question text"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
                <select
                  value={question.type}
                  onChange={(e) => {
                    const updatedQuestions = [...newEventTemplate.customQuestions];
                    updatedQuestions[index].type = e.target.value;
                    setNewEventTemplate((prev) => ({ ...prev, customQuestions: updatedQuestions }));
                  }}
                  style={{
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    minWidth: '100px',
                  }}
                >
                  <option value="text">Text</option>
                  <option value="yes/no">Yes/No</option>
                  <option value="number">Number</option>
                  <option value="select">Select</option>
                </select>
                <button
                  onClick={() => {
                    const updatedQuestions = newEventTemplate.customQuestions.filter((_, i) => i !== index);
                    setNewEventTemplate((prev) => ({ ...prev, customQuestions: updatedQuestions }));
                  }}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  <Trash2 style={{ height: '14px', width: '14px' }} />
                </button>
              </div>

              {question.type === 'select' && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    value={question.options ? question.options.join(', ') : ''}
                    onChange={(e) => {
                      const updatedQuestions = [...newEventTemplate.customQuestions];
                      updatedQuestions[index].options = e.target.value
                        .split(',')
                        .map((opt) => opt.trim())
                        .filter((opt) => opt);
                      setNewEventTemplate((prev) => ({ ...prev, customQuestions: updatedQuestions }));
                    }}
                    placeholder="Options separated by commas (e.g., Morning, Afternoon, Evening)"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => {
                      const updatedQuestions = [...newEventTemplate.customQuestions];
                      updatedQuestions[index].required = e.target.checked;
                      setNewEventTemplate((prev) => ({ ...prev, customQuestions: updatedQuestions }));
                    }}
                  />
                  Required question
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              setNewEventTemplate((prev) => ({
                ...prev,
                customQuestions: [
                  ...prev.customQuestions,
                  { question: '', type: 'text', required: false, options: [] },
                ],
              }));
            }}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            Add Question
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
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
              if (newEventTemplate.name && newEventTemplate.eventType) {
                onCreate();
              } else {
                addNotification('Please fill in template name and event type', 'error');
              }
            }}
            style={{
              backgroundColor: '#3b82f6',
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

export default EventTemplateCreationModal;
