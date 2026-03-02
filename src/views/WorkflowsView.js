import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Play,
  UserCheck,
  ClipboardList,
  Clock,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getWorkflows,
  saveWorkflows,
  executeWorkflow,
  getWorkflowLog,
  checkAbsentMembers,
} from '../services/workflowService';

const TRIGGER_META = {
  first_checkin: { label: 'First Check-in', icon: UserCheck, color: '#8b5cf6' },
  registration: { label: 'Registration', icon: ClipboardList, color: '#7B2D4E' },
  absent_weeks: { label: 'Absent Member', icon: Clock, color: '#f59e0b' },
  event_upcoming: { label: 'Upcoming Event', icon: CalendarClock, color: '#10b981' },
};

const WorkflowsView = ({ addNotification, attendees, events, volunteers }) => {
  const [workflows, setWorkflows] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [expandedWorkflow, setExpandedWorkflow] = useState(null);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [runningWorkflow, setRunningWorkflow] = useState(null);

  useEffect(() => {
    setWorkflows(getWorkflows());
    setActivityLog(getWorkflowLog());
  }, []);

  const handleToggle = useCallback(
    (workflowId) => {
      const updated = workflows.map((w) => (w.id === workflowId ? { ...w, enabled: !w.enabled } : w));
      setWorkflows(updated);
      saveWorkflows(updated);
      const wf = updated.find((w) => w.id === workflowId);
      addNotification(`${wf.name} ${wf.enabled ? 'enabled' : 'disabled'}`, 'success');
    },
    [workflows, addNotification]
  );

  const handleTestRun = useCallback(
    async (workflow) => {
      setRunningWorkflow(workflow.id);
      const demoContext = {
        name: 'Demo User',
        email: 'demo@example.com',
        eventName: 'Sunday Service',
        weeks: '3',
      };
      try {
        const result = await executeWorkflow(workflow.id, demoContext);
        if (result.success) {
          addNotification(`Test run of "${workflow.name}" completed successfully!`, 'success');
        } else {
          addNotification(`Test run failed: ${result.error}`, 'error');
        }
        setActivityLog(getWorkflowLog());
      } catch (error) {
        addNotification(`Test run failed: ${error.message}`, 'error');
      } finally {
        setRunningWorkflow(null);
      }
    },
    [addNotification]
  );

  const handleTriggerValueChange = useCallback(
    (workflowId, newValue) => {
      const updated = workflows.map((w) =>
        w.id === workflowId ? { ...w, triggerValue: parseInt(newValue, 10) || 0 } : w
      );
      setWorkflows(updated);
      saveWorkflows(updated);
    },
    [workflows]
  );

  const handleCheckAbsent = useCallback(() => {
    const absent = checkAbsentMembers(attendees || [], events || []);
    if (absent.length === 0) {
      addNotification('No absent members found (all recently active or no check-in data).', 'info');
    } else {
      addNotification(`Found ${absent.length} absent member(s). Check console for details.`, 'warning');
    }
  }, [attendees, events, addNotification]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle style={{ height: '14px', width: '14px', color: '#10b981' }} />;
      case 'failed':
        return <XCircle style={{ height: '14px', width: '14px', color: '#ef4444' }} />;
      case 'scheduled':
        return <Clock style={{ height: '14px', width: '14px', color: '#f59e0b' }} />;
      default:
        return <AlertCircle style={{ height: '14px', width: '14px', color: '#9B9590' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return { bg: '#dcfce7', color: '#16a34a' };
      case 'failed':
        return { bg: '#fef2f2', color: '#dc2626' };
      case 'scheduled':
        return { bg: '#fef3c7', color: '#d97706' };
      default:
        return { bg: '#F0E8DD', color: '#9B9590' };
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Zap style={{ height: '28px', width: '28px', color: '#f59e0b' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Automations</h2>
          </div>
          <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>
            Automated workflows that run when events happen
          </p>
        </div>
        <button
          onClick={handleCheckAbsent}
          style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Clock style={{ height: '16px', width: '16px' }} />
          Check Absent Members
        </button>
      </div>

      {/* Workflow Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {workflows.map((workflow) => {
          const trigger = TRIGGER_META[workflow.trigger] || {
            label: workflow.trigger,
            icon: Zap,
            color: '#9B9590',
          };
          const TriggerIcon = trigger.icon;
          const isExpanded = expandedWorkflow === workflow.id;
          const isEditing = editingWorkflow === workflow.id;
          const isRunning = runningWorkflow === workflow.id;

          return (
            <div
              key={workflow.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `2px solid ${workflow.enabled ? trigger.color + '33' : '#E8E0D8'}`,
                overflow: 'hidden',
                opacity: workflow.enabled ? 1 : 0.7,
                transition: 'all 0.2s',
              }}
            >
              {/* Card Header */}
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Trigger Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: trigger.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <TriggerIcon style={{ height: '24px', width: '24px', color: trigger.color }} />
                </div>

                {/* Name & Description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{workflow.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        backgroundColor: trigger.color + '20',
                        color: trigger.color,
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {trigger.label}
                    </span>
                    <span style={{ fontSize: '13px', color: '#9B9590' }}>
                      {workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}
                    </span>
                    {workflow.triggerValue !== undefined && (
                      <span style={{ fontSize: '13px', color: '#9B9590' }}>
                        &middot;{' '}
                        {workflow.trigger === 'absent_weeks'
                          ? `${workflow.triggerValue} weeks`
                          : `${workflow.triggerValue}h before`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleTestRun(workflow)}
                    disabled={isRunning || !workflow.enabled}
                    style={{
                      backgroundColor: isRunning ? '#d1d5db' : '#fef3c7',
                      color: isRunning ? '#9B9590' : '#92400e',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      cursor: isRunning || !workflow.enabled ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Play style={{ height: '14px', width: '14px' }} />
                    {isRunning ? 'Running...' : 'Test Run'}
                  </button>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(workflow.id)}
                    aria-label={workflow.enabled ? 'Disable workflow' : 'Enable workflow'}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      backgroundColor: workflow.enabled ? '#f59e0b' : '#d1d5db',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background-color 0.2s',
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: workflow.enabled ? '27px' : '3px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </button>

                  {/* Expand */}
                  <button
                    onClick={() => setExpandedWorkflow(isExpanded ? null : workflow.id)}
                    aria-label={isExpanded ? 'Collapse workflow' : 'Expand workflow'}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#9B9590',
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp style={{ height: '20px', width: '20px' }} />
                    ) : (
                      <ChevronDown style={{ height: '20px', width: '20px' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #E8E0D8', padding: '20px', backgroundColor: '#fafafa' }}>
                  {/* Action Steps */}
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#6B6560' }}>
                    Workflow Steps
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {workflow.actions.map((action, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          border: '1px solid #E8E0D8',
                        }}
                      >
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            {action.type === 'send_email' ? `Send Email: ${action.template}` : 'Notify Staff'}
                          </span>
                          {action.delay > 0 && (
                            <span style={{ fontSize: '12px', color: '#9B9590', marginLeft: '8px' }}>
                              (after {action.delay} day{action.delay !== 1 ? 's' : ''})
                            </span>
                          )}
                        </div>
                        {action.type === 'notify_staff' && action.message && (
                          <span style={{ fontSize: '12px', color: '#9B9590', fontStyle: 'italic' }}>
                            &quot;{action.message}&quot;
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Edit Trigger Settings */}
                  {workflow.triggerValue !== undefined && (
                    <div>
                      <button
                        onClick={() => setEditingWorkflow(isEditing ? null : workflow.id)}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#9B9590',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          marginBottom: isEditing ? '12px' : 0,
                        }}
                      >
                        {isEditing ? 'Close Settings' : 'Edit Trigger Settings'}
                      </button>
                      {isEditing && (
                        <div
                          style={{
                            padding: '16px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #E8E0D8',
                          }}
                        >
                          <label
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: '500',
                              marginBottom: '6px',
                            }}
                          >
                            {workflow.trigger === 'absent_weeks'
                              ? 'Weeks absent before triggering:'
                              : 'Hours before event to trigger:'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={workflow.triggerValue}
                            onChange={(e) => handleTriggerValueChange(workflow.id, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px',
                              width: '100px',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Activity Log */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #E8E0D8',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Activity style={{ height: '20px', width: '20px', color: '#f59e0b' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Activity Log</h3>
          <span
            style={{
              fontSize: '13px',
              color: '#9B9590',
              marginLeft: '4px',
            }}
          >
            ({activityLog.length} entries)
          </span>
        </div>

        {activityLog.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Zap style={{ height: '40px', width: '40px', color: '#d1d5db', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>
              No workflow activity yet. Run a test to see results here.
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activityLog.slice(0, 20).map((entry) => {
              const statusStyle = getStatusColor(entry.status);
              return (
                <div
                  key={entry.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #F0E8DD',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {getStatusIcon(entry.status)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{entry.workflowName}</span>
                      <span
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          padding: '1px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#9B9590' }}>
                      {entry.actionType === 'send_email' ? 'Email' : 'Staff Notification'} &rarr; {entry.recipient}
                      {entry.detail && <span> &middot; {entry.detail}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowsView;
