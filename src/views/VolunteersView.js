import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AVAILABILITY_STATUSES = {
  available: { label: 'Available', color: '#10b981', bg: '#d1fae5' },
  busy: { label: 'Busy', color: '#f59e0b', bg: '#fef3c7' },
  unavailable: { label: 'Unavailable', color: '#ef4444', bg: '#fee2e2' },
};

const getVolunteerAvailabilityStatus = (volunteerId, volunteerAvailability) => {
  const schedule = volunteerAvailability[volunteerId];
  if (!schedule) return 'available';
  const availableDays = Object.values(schedule).filter(Boolean).length;
  if (availableDays >= 5) return 'available';
  if (availableDays >= 2) return 'busy';
  return 'unavailable';
};

const VolunteersView = ({
  volunteers,
  setVolunteers,
  events,
  setEvents,
  searchTerm,
  setSearchTerm,
  filterVolunteers,
  setShowAddVolunteer,
  addNotification,
  volunteerAvailability,
  setVolunteerAvailability,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('roster');

  const formatEventDates = useCallback((event) => {
    let dateString = '';
    if (event.dateType === 'recurring') {
      dateString = event.recurrencePattern;
    } else if (event.dateType === 'ongoing') {
      dateString = 'Ongoing';
    } else if (event.dates && event.dates.length === 1) {
      dateString = new Date(event.dates[0]).toLocaleDateString();
    } else if (event.dates && event.dates.length > 1) {
      dateString = `Multiple dates (${event.dates.length})`;
    } else {
      dateString = 'No date set';
    }
    if (event.startTime && event.endTime) {
      dateString += ` \u2022 ${event.startTime} - ${event.endTime}`;
    }
    return dateString;
  }, []);

  const upcomingEvents = useMemo(() => events.filter((e) => e.status === 'active'), [events]);

  const getStaffingColor = useCallback((needed, assignedCount) => {
    if (assignedCount >= needed) return '#10b981';
    if (assignedCount > 0) return '#f59e0b';
    return '#ef4444';
  }, []);

  const getStaffingLabel = useCallback((needed, assignedCount) => {
    if (assignedCount >= needed) return 'Fully Staffed';
    if (assignedCount > 0) return 'Partially Staffed';
    return 'Unstaffed';
  }, []);

  const handleAssignVolunteer = useCallback(
    (eventId, roleIndex, volunteerId) => {
      if (!volunteerId) return;
      const vid = parseInt(volunteerId, 10);
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event;
          const updatedRoles = (event.requiredRoles || []).map((role, idx) => {
            if (idx !== roleIndex) return role;
            if (role.assigned.includes(vid)) return role;
            return { ...role, assigned: [...role.assigned, vid] };
          });
          const allAssigned = updatedRoles.flatMap((r) => r.assigned);
          const uniqueVolunteers = [...new Set([...event.volunteers, ...allAssigned])];
          return { ...event, requiredRoles: updatedRoles, volunteers: uniqueVolunteers };
        })
      );
      const vol = volunteers.find((v) => v.id === vid);
      if (vol) {
        addNotification(`${vol.name} assigned successfully!`, 'success');
      }
    },
    [setEvents, volunteers, addNotification]
  );

  const handleUnassignVolunteer = useCallback(
    (eventId, roleIndex, volunteerId) => {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event;
          const updatedRoles = (event.requiredRoles || []).map((role, idx) => {
            if (idx !== roleIndex) return role;
            return { ...role, assigned: role.assigned.filter((id) => id !== volunteerId) };
          });
          return { ...event, requiredRoles: updatedRoles };
        })
      );
    },
    [setEvents]
  );

  const handleAddRequiredRole = useCallback(
    (eventId) => {
      const roleName = window.prompt('Enter role name (e.g., Greeter, Sound Tech):');
      if (!roleName || !roleName.trim()) return;
      const neededStr = window.prompt('How many needed?', '1');
      const needed = parseInt(neededStr, 10) || 1;
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== eventId) return event;
          const requiredRoles = event.requiredRoles || [];
          return {
            ...event,
            requiredRoles: [...requiredRoles, { role: roleName.trim(), needed, assigned: [] }],
          };
        })
      );
      addNotification(`Role "${roleName.trim()}" added!`, 'success');
    },
    [setEvents, addNotification]
  );

  const toggleAvailability = useCallback(
    (volunteerId, dayIndex) => {
      setVolunteerAvailability((prev) => {
        const schedule = prev[volunteerId] || {};
        const current = schedule[dayIndex] !== undefined ? schedule[dayIndex] : true;
        return {
          ...prev,
          [volunteerId]: {
            ...schedule,
            [dayIndex]: !current,
          },
        };
      });
    },
    [setVolunteerAvailability]
  );

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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Volunteers</h2>
        <button
          onClick={() => setShowAddVolunteer(true)}
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
          <Plus style={{ height: '16px', width: '16px' }} />
          Add Volunteer
        </button>
      </div>

      {/* Sub-tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {[
            { id: 'roster', label: 'Roster', icon: Users },
            { id: 'scheduling', label: 'Scheduling', icon: Calendar },
            { id: 'availability', label: 'Availability', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderBottom: activeSubTab === tab.id ? '2px solid #3b82f6' : 'none',
                  color: activeSubTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontWeight: activeSubTab === tab.id ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                }}
              >
                <Icon style={{ height: '16px', width: '16px' }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== ROSTER SUB-TAB ==================== */}
      {activeSubTab === 'roster' && (
        <div>
          {/* Search Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '16px',
                  width: '16px',
                  color: '#6b7280',
                }}
              />
              <input
                type="text"
                aria-label="Search volunteers"
                placeholder="Search volunteers by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {filterVolunteers(volunteers, searchTerm).map((volunteer, index) => {
              const volunteerEvents = events.filter((event) => event.volunteers.includes(volunteer.id));
              const status = getVolunteerAvailabilityStatus(volunteer.id, volunteerAvailability);
              const statusInfo = AVAILABILITY_STATUSES[status];
              return (
                <div
                  key={volunteer.id}
                  style={{
                    padding: '20px',
                    borderBottom: index < volunteers.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: 0,
                          }}
                        >
                          {volunteer.name}
                        </h3>
                        <span
                          style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0 0 2px 0',
                        }}
                      >
                        {volunteer.email}
                      </p>
                      {volunteer.phone && (
                        <p
                          style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '0 0 8px 0',
                          }}
                        >
                          {volunteer.phone}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span
                          style={{
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          {volunteer.role}
                        </span>
                        <span
                          style={{
                            backgroundColor: volunteer.securityLevel === 'admin' ? '#fef3c7' : '#f3f4f6',
                            color: volunteer.securityLevel === 'admin' ? '#d97706' : '#6b7280',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {volunteer.securityLevel === 'admin' && <Shield style={{ height: '10px', width: '10px' }} />}
                          {volunteer.securityLevel}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ textAlign: 'right' }}>
                        <p
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            margin: '0',
                            color: '#3b82f6',
                          }}
                        >
                          {volunteerEvents.length}
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            margin: '2px 0 0 0',
                          }}
                        >
                          Total Hours
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => {
                            const newName = window.prompt('Edit volunteer name:', volunteer.name);
                            if (newName) {
                              setVolunteers((prev) =>
                                prev.map((v) => (v.id === volunteer.id ? { ...v, name: newName } : v))
                              );
                            }
                          }}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                          title="Edit Volunteer"
                        >
                          <Edit2 style={{ height: '14px', width: '14px' }} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Remove volunteer ${volunteer.name}?`)) {
                              setVolunteers((prev) => prev.filter((v) => v.id !== volunteer.id));
                              setEvents((prev) =>
                                prev.map((event) => ({
                                  ...event,
                                  volunteers: event.volunteers.filter((vId) => vId !== volunteer.id),
                                }))
                              );
                            }
                          }}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                          title="Remove Volunteer"
                        >
                          <Trash2 style={{ height: '14px', width: '14px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {volunteerEvents.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '4px',
                        }}
                      >
                        Assigned Events:
                      </p>
                      {volunteerEvents.map((event) => (
                        <div
                          key={event.id}
                          style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '2px',
                          }}
                        >
                          {event.name} - {formatEventDates(event)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filterVolunteers(volunteers, searchTerm).length === 0 && (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <Users
                  style={{
                    height: '40px',
                    width: '40px',
                    margin: '0 auto 12px',
                  }}
                />
                <p style={{ fontSize: '16px', margin: 0 }}>No volunteers found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCHEDULING SUB-TAB ==================== */}
      {activeSubTab === 'scheduling' && (
        <div>
          {upcomingEvents.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '40px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center',
                color: '#9ca3af',
              }}
            >
              <Calendar
                style={{
                  height: '40px',
                  width: '40px',
                  margin: '0 auto 12px',
                }}
              />
              <p style={{ fontSize: '16px', margin: 0 }}>No upcoming events to schedule</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {upcomingEvents.map((event) => {
                const requiredRoles = event.requiredRoles || [];
                const totalNeeded = requiredRoles.reduce((sum, r) => sum + r.needed, 0);
                const totalAssigned = requiredRoles.reduce((sum, r) => sum + r.assigned.length, 0);
                const overallColor = getStaffingColor(totalNeeded || 1, totalAssigned);

                return (
                  <div
                    key={event.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Event header */}
                    <div
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: '0 0 4px 0',
                          }}
                        >
                          {event.name}
                        </h3>
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            margin: 0,
                          }}
                        >
                          {formatEventDates(event)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {requiredRoles.length > 0 && (
                          <span
                            style={{
                              backgroundColor: overallColor + '20',
                              color: overallColor,
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            {getStaffingLabel(totalNeeded || 1, totalAssigned)}
                          </span>
                        )}
                        <button
                          onClick={() => handleAddRequiredRole(event.id)}
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
                          + Add Role
                        </button>
                      </div>
                    </div>

                    {/* Required roles */}
                    <div style={{ padding: '16px 20px' }}>
                      {requiredRoles.length === 0 ? (
                        <p
                          style={{
                            color: '#9ca3af',
                            fontSize: '14px',
                            margin: 0,
                            textAlign: 'center',
                            padding: '12px 0',
                          }}
                        >
                          No roles defined yet. Click &quot;+ Add Role&quot; to get started.
                        </p>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                          }}
                        >
                          {requiredRoles.map((role, roleIndex) => {
                            const assignedCount = role.assigned.length;
                            const staffColor = getStaffingColor(role.needed, assignedCount);
                            const emptySlots = Math.max(0, role.needed - assignedCount);
                            return (
                              <div
                                key={roleIndex}
                                style={{
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  padding: '12px',
                                  borderLeft: `4px solid ${staffColor}`,
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                      }}
                                    >
                                      {role.role}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                      }}
                                    >
                                      ({assignedCount}/{role.needed} filled)
                                    </span>
                                  </div>
                                  {assignedCount >= role.needed ? (
                                    <CheckCircle
                                      style={{
                                        height: '16px',
                                        width: '16px',
                                        color: '#10b981',
                                      }}
                                    />
                                  ) : (
                                    <AlertCircle
                                      style={{
                                        height: '16px',
                                        width: '16px',
                                        color: staffColor,
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Assigned volunteers */}
                                <div
                                  style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px',
                                    marginBottom: emptySlots > 0 ? '8px' : '0',
                                  }}
                                >
                                  {role.assigned.map((vid) => {
                                    const vol = volunteers.find((v) => v.id === vid);
                                    return (
                                      <span
                                        key={vid}
                                        style={{
                                          backgroundColor: '#dbeafe',
                                          color: '#1d4ed8',
                                          padding: '4px 10px',
                                          borderRadius: '12px',
                                          fontSize: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                        }}
                                      >
                                        <UserCheck
                                          style={{
                                            height: '12px',
                                            width: '12px',
                                          }}
                                        />
                                        {vol ? vol.name : 'Unknown'}
                                        <button
                                          onClick={() => handleUnassignVolunteer(event.id, roleIndex, vid)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#1d4ed8',
                                            cursor: 'pointer',
                                            padding: '0 0 0 2px',
                                            fontSize: '14px',
                                            lineHeight: 1,
                                          }}
                                          title="Remove"
                                        >
                                          \u00d7
                                        </button>
                                      </span>
                                    );
                                  })}
                                </div>

                                {/* Empty slots + assign dropdown */}
                                {emptySlots > 0 && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: '12px',
                                        color: staffColor,
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {emptySlots} slot
                                      {emptySlots > 1 ? 's' : ''} open
                                    </span>
                                    <select
                                      onChange={(e) => {
                                        handleAssignVolunteer(event.id, roleIndex, e.target.value);
                                        e.target.value = '';
                                      }}
                                      defaultValue=""
                                      style={{
                                        padding: '4px 8px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#374151',
                                      }}
                                    >
                                      <option value="" disabled>
                                        Assign volunteer...
                                      </option>
                                      {volunteers
                                        .filter((v) => !role.assigned.includes(v.id))
                                        .map((v) => (
                                          <option key={v.id} value={v.id}>
                                            {v.name} ({v.role})
                                          </option>
                                        ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== AVAILABILITY SUB-TAB ==================== */}
      {activeSubTab === 'availability' && (
        <div>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>Weekly Availability</h3>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: '4px 0 0 0',
                }}
              >
                Click a cell to toggle availability for each day
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '600px',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        color: '#374151',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      Volunteer
                    </th>
                    {DAY_LABELS.map((day) => (
                      <th
                        key={day}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: '#374151',
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: '#f9fafb',
                          minWidth: '60px',
                        }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer) => {
                    const schedule = volunteerAvailability[volunteer.id] || {};
                    return (
                      <tr key={volunteer.id}>
                        <td
                          style={{
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          {volunteer.name}
                        </td>
                        {DAY_LABELS.map((day, dayIndex) => {
                          const isAvailable = schedule[dayIndex] !== undefined ? schedule[dayIndex] : true;
                          return (
                            <td
                              key={day}
                              onClick={() => toggleAvailability(volunteer.id, dayIndex)}
                              style={{
                                padding: '12px 16px',
                                textAlign: 'center',
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                backgroundColor: isAvailable ? '#d1fae5' : '#f3f4f6',
                                transition: 'background-color 0.2s',
                              }}
                              title={isAvailable ? 'Available' : 'Unavailable'}
                            >
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  color: isAvailable ? '#059669' : '#9ca3af',
                                }}
                              >
                                {isAvailable ? '\u2713' : '\u2014'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {volunteers.length === 0 && (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}
              >
                <Users
                  style={{
                    height: '40px',
                    width: '40px',
                    margin: '0 auto 12px',
                  }}
                />
                <p style={{ fontSize: '16px', margin: 0 }}>No volunteers added yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteersView;
