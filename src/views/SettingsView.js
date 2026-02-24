import React from 'react';
import { Plus } from 'lucide-react';

const SettingsView = ({ events, eventTemplates, addNotification, setShowCreateEventTemplate }) => {
  return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Settings</h2>
            
            {/* Event Templates Management */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Event Templates</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {Object.entries(eventTemplates).map(([key, template]) => (
                  <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{template.name}</h4>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete template "${template.name}"?`)) {
                            const newTemplates = { ...eventTemplates };
                            delete newTemplates[key];
                            // In a real app, this would update state
                            alert('Template deleted (in real app, this would persist)');
                          }
                        }}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Type: {template.eventType}</p>
                    {template.customQuestions && template.customQuestions.length > 0 && (
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Questions:</p>
                        {template.customQuestions.map((q, index) => (
                          <p key={index} style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>
                            • {q.question} ({q.type})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setShowCreateEventTemplate(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus style={{ height: '16px', width: '16px' }} />
                Create New Template
              </button>
            </div>

            {/* Archive Settings */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Archive Settings</h3>
              <div style={{ space: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" />
                    <span>Auto-archive events 30 days after completion</span>
                  </label>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" />
                    <span>Archive events when capacity is reached</span>
                  </label>
                </div>
                <button
                  onClick={() => {
                    const archivedCount = events.filter(e => e.status === 'archived').length;
                    addNotification(`${archivedCount} events currently archived`, 'info');
                  }}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View Archive Statistics
                </button>
              </div>
            </div>
          </div>
  );
};

export default SettingsView;
