import React from 'react';
import logger from '../utils/logger';
import { Mail, Send, Plus, MessageCircle } from 'lucide-react';
import { mockEmailService, enhancedMessageTemplates } from '../services/emailService';

const CommunicationsView = ({
  communicationsTab,
  setCommunicationsTab,
  communications,
  notificationSettings,
  toggleNotificationSetting,
  setShowSendMessage,
  setShowCreateTemplate,
  setNewMessage,
  addNotification,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Communications</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={async () => {
              try {
                await mockEmailService.sendEmail(
                  'test@example.com',
                  'Test Email',
                  'This is a test email from ChurchConnect Event Manager.'
                );
                addNotification('Test email sent!', 'success');
              } catch (error) {
                addNotification('Failed to send test email.', 'error');
              }
            }}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
            }}
          >
            <Mail style={{ height: '16px', width: '16px' }} />
            Test Email
          </button>
          <button
            onClick={() => setShowSendMessage(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
            }}
          >
            <Send style={{ height: '16px', width: '16px' }} />
            Send Message
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setCommunicationsTab('compose')}
          style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderBottom: communicationsTab === 'compose' ? '2px solid #3b82f6' : 'none',
            color: communicationsTab === 'compose' ? '#3b82f6' : '#6b7280',
            fontWeight: 'bold',
          }}
        >
          Quick Send
        </button>
        <button
          onClick={() => setCommunicationsTab('history')}
          style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderBottom: communicationsTab === 'history' ? '2px solid #3b82f6' : 'none',
            color: communicationsTab === 'history' ? '#3b82f6' : '#6b7280',
            fontWeight: 'bold',
          }}
        >
          History ({communications.length})
        </button>
        <button
          onClick={() => setCommunicationsTab('recent')}
          style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderBottom: communicationsTab === 'recent' ? '2px solid #3b82f6' : 'none',
            color: communicationsTab === 'recent' ? '#3b82f6' : '#6b7280',
            fontWeight: 'bold',
          }}
        >
          Recent ({communications.slice(0, 3).length})
        </button>
        <button
          onClick={() => setCommunicationsTab('settings')}
          style={{
            padding: '8px 16px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderBottom: communicationsTab === 'settings' ? '2px solid #3b82f6' : 'none',
            color: communicationsTab === 'settings' ? '#3b82f6' : '#6b7280',
            fontWeight: 'bold',
          }}
        >
          Automation
        </button>
      </div>

      {communicationsTab === 'compose' && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Enhanced Email Templates</h3>
            <button
              onClick={() => setShowCreateTemplate(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              Create Template
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {Object.entries(enhancedMessageTemplates).map(([key, template]) => (
              <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'capitalize' }}>
                  {key.replace('-', ' ')}
                </h4>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{template.subject}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.4' }}>
                  {template.message.substring(0, 100)}...
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setNewMessage((prev) => ({
                        ...prev,
                        subject: template.subject,
                        message: template.message,
                        type: key.includes('reminder')
                          ? 'reminder'
                          : key.includes('update')
                            ? 'update'
                            : key.includes('thank')
                              ? 'thank-you'
                              : 'announcement',
                      }));
                      setShowSendMessage(true);
                    }}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => {
                      logger.log(`Template Preview:\n\nSubject: ${template.subject}\n\nMessage:\n${template.message}`);
                      addNotification('Template preview shown in console.', 'info');
                    }}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {communicationsTab === 'history' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {communications.map((comm, index) => (
            <div
              key={comm.id}
              style={{
                padding: '20px',
                borderBottom: index < communications.length - 1 ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{comm.subject}</h4>
                    <span
                      style={{
                        backgroundColor: comm.type === 'automated' ? '#fef3c7' : '#dbeafe',
                        color: comm.type === 'automated' ? '#d97706' : '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      {comm.type}
                    </span>
                    {comm.status && (
                      <span
                        style={{
                          backgroundColor: comm.status === 'sent' ? '#dcfce7' : '#fef3c7',
                          color: comm.status === 'sent' ? '#16a34a' : '#d97706',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                        }}
                      >
                        {comm.status}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                    To: {comm.recipients} • {comm.recipientCount} recipient{comm.recipientCount !== 1 ? 's' : ''} •{' '}
                    {comm.sendVia}
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151', margin: '0', lineHeight: '1.4' }}>
                    {comm.message.length > 120 ? comm.message.substring(0, 120) + '...' : comm.message}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                    {new Date(comm.sentDate).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>By {comm.sentBy}</p>
                </div>
              </div>
            </div>
          ))}

          {communications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Mail style={{ height: '48px', width: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Messages Sent Yet</h3>
              <p style={{ color: '#6b7280' }}>Your communication history will appear here</p>
            </div>
          )}
        </div>
      )}

      {communicationsTab === 'recent' && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Recent Communications</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Your most recent communications and messages sent.
          </p>

          {communications.slice(0, 5).map((item) => (
            <div
              key={item.id}
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{item.subject}</h4>
                <span
                  style={{
                    backgroundColor: item.type === 'automated' ? '#fef3c7' : '#dbeafe',
                    color: item.type === 'automated' ? '#d97706' : '#1d4ed8',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.type}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                To: {item.recipients} • {item.recipientCount} recipient{item.recipientCount !== 1 ? 's' : ''} •{' '}
                {item.sendVia}
              </p>
              <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                {item.message.length > 150 ? item.message.substring(0, 150) + '...' : item.message}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                }}
              >
                <span>Sent by {item.sentBy}</span>
                <span>{new Date(item.sentDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {communications.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <MessageCircle style={{ height: '32px', width: '32px', color: '#6b7280', margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', marginBottom: '4px' }}>No Communications Yet</h4>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Your recent communications will appear here</p>
            </div>
          )}
        </div>
      )}

      {communicationsTab === 'settings' && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Automated Notifications</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Configure which notifications are sent automatically when certain events occur.
          </p>

          <div style={{ space: '16px' }}>
            {[
              {
                key: 'registrationConfirmation',
                label: 'Registration Confirmation',
                description: 'Send when someone registers for an event',
              },
              {
                key: 'volunteerReminders',
                label: 'Volunteer Reminders',
                description: 'Send 24 hours before volunteer shifts',
              },
              {
                key: 'donationThankYou',
                label: 'Donation Thank You',
                description: 'Automatic thank you for donations',
              },
              { key: 'eventUpdates', label: 'Event Updates', description: 'Notify attendees of event changes' },
              {
                key: 'checkInConfirmation',
                label: 'Check-in Confirmation',
                description: 'Send when attendees are checked in',
              },
            ].map((setting) => (
              <div
                key={setting.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  marginBottom: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{setting.label}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleNotificationSetting(setting.key)}
                  style={{
                    backgroundColor: notificationSettings[setting.key] ? '#10b981' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {notificationSettings[setting.key] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationsView;
