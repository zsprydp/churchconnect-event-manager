import React, { useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Mail,
  Users,
  Link,
  Filter,
} from 'lucide-react';

const PRESET_COLORS = [
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#7B2D4E',
  '#ef4444',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#6366f1',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MinistriesView = ({ ministries, setMinistries, events, addNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMinistry, setFilterMinistry] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedMembers, setExpandedMembers] = useState({});

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    leader: '',
    leaderEmail: '',
    members: [],
    meetingDay: 'Monday',
    meetingTime: '18:00',
    events: [],
  });

  const [newMemberName, setNewMemberName] = useState('');

  const resetForm = useCallback(() => {
    setForm({
      name: '',
      description: '',
      color: PRESET_COLORS[0],
      leader: '',
      leaderEmail: '',
      members: [],
      meetingDay: 'Monday',
      meetingTime: '18:00',
      events: [],
    });
    setNewMemberName('');
    setShowForm(false);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name.trim()) {
      addNotification('Please enter a ministry name.', 'error');
      return;
    }
    if (!form.leader.trim()) {
      addNotification('Please enter a leader name.', 'error');
      return;
    }

    if (editingId) {
      setMinistries((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...form } : m)));
      addNotification('Ministry updated successfully!', 'success');
    } else {
      const newId = ministries.length > 0 ? Math.max(...ministries.map((m) => m.id)) + 1 : 1;
      setMinistries((prev) => [...prev, { id: newId, ...form }]);
      addNotification('Ministry created successfully!', 'success');
    }

    resetForm();
  }, [form, editingId, ministries, setMinistries, addNotification, resetForm]);

  const handleEdit = useCallback((ministry) => {
    setEditingId(ministry.id);
    setForm({
      name: ministry.name,
      description: ministry.description || '',
      color: ministry.color || PRESET_COLORS[0],
      leader: ministry.leader || '',
      leaderEmail: ministry.leaderEmail || '',
      members: ministry.members || [],
      meetingDay: ministry.meetingDay || 'Monday',
      meetingTime: ministry.meetingTime || '18:00',
      events: ministry.events || [],
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    (ministry) => {
      if (window.confirm(`Delete "${ministry.name}" ministry?`)) {
        setMinistries((prev) => prev.filter((m) => m.id !== ministry.id));
        addNotification('Ministry deleted.', 'success');
      }
    },
    [setMinistries, addNotification]
  );

  const handleAddMember = useCallback(() => {
    if (!newMemberName.trim()) return;
    setForm((prev) => ({ ...prev, members: [...prev.members, newMemberName.trim()] }));
    setNewMemberName('');
  }, [newMemberName]);

  const handleRemoveMember = useCallback((index) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleEventLink = useCallback((eventId) => {
    setForm((prev) => {
      const linked = prev.events.includes(eventId);
      return {
        ...prev,
        events: linked ? prev.events.filter((id) => id !== eventId) : [...prev.events, eventId],
      };
    });
  }, []);

  const toggleExpandMembers = useCallback((ministryId) => {
    setExpandedMembers((prev) => ({ ...prev, [ministryId]: !prev[ministryId] }));
  }, []);

  const getLinkedEventNames = useCallback(
    (eventIds) => {
      return (eventIds || [])
        .map((id) => {
          const event = events.find((e) => e.id === id);
          return event ? event.name : null;
        })
        .filter(Boolean);
    },
    [events]
  );

  const filteredMinistries = ministries.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.leader && m.leader.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterMinistry === 'all' || m.id === parseInt(filterMinistry);
    return matchesSearch && matchesFilter;
  });

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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Ministries</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          <Plus style={{ height: '16px', width: '16px' }} />
          Create Ministry
        </button>
      </div>

      {/* Search and Filter */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '400px' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              height: '16px',
              width: '16px',
              color: '#9B9590',
            }}
          />
          <input
            type="text"
            aria-label="Search ministries"
            placeholder="Search ministries..."
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter style={{ height: '16px', width: '16px', color: '#9B9590' }} />
          <select
            aria-label="Filter by ministry"
            value={filterMinistry}
            onChange={(e) => setFilterMinistry(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            <option value="all">All Ministries</option>
            {ministries.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              {editingId ? 'Edit Ministry' : 'Create New Ministry'}
            </h3>
            <button
              onClick={resetForm}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X style={{ height: '20px', width: '20px', color: '#9B9590' }} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Ministry Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Youth Group"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Leader Name *
              </label>
              <input
                type="text"
                value={form.leader}
                onChange={(e) => setForm((prev) => ({ ...prev, leader: e.target.value }))}
                placeholder="Leader name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Leader Email
              </label>
              <input
                type="email"
                value={form.leaderEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, leaderEmail: e.target.value }))}
                placeholder="leader@email.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Meeting Day
              </label>
              <select
                value={form.meetingDay}
                onChange={(e) => setForm((prev) => ({ ...prev, meetingDay: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Meeting Time
              </label>
              <input
                type="time"
                value={form.meetingTime}
                onChange={(e) => setForm((prev) => ({ ...prev, meetingTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Ministry Color
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm((prev) => ({ ...prev, color }))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: form.color === color ? '3px solid #2D2A26' : '2px solid transparent',
                    cursor: 'pointer',
                    outline: form.color === color ? '2px solid white' : 'none',
                    outlineOffset: '-4px',
                  }}
                  title={color}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Members */}
          <div
            style={{
              borderTop: '1px solid #E8E0D8',
              paddingTop: '16px',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>Members</h4>
            {form.members.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {form.members.map((member, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#FAF5EF',
                      borderRadius: '6px',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: '14px' }}>{member}</span>
                    <button
                      onClick={() => handleRemoveMember(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#dc2626',
                      }}
                    >
                      <X style={{ height: '14px', width: '14px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Member name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMember();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={handleAddMember}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                <UserPlus style={{ height: '14px', width: '14px' }} />
                Add
              </button>
            </div>
          </div>

          {/* Link Events */}
          <div
            style={{
              borderTop: '1px solid #E8E0D8',
              paddingTop: '16px',
              marginBottom: '16px',
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>Linked Events</h4>
            {events.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#9B9590' }}>No events available to link.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {events.map((event) => {
                  const isLinked = form.events.includes(event.id);
                  return (
                    <button
                      key={event.id}
                      onClick={() => toggleEventLink(event.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: isLinked ? '2px solid #7B2D4E' : '1px solid #d1d5db',
                        backgroundColor: isLinked ? '#FAF5EF' : 'white',
                        color: isLinked ? '#7B2D4E' : '#6B6560',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isLinked ? '600' : '400',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Link style={{ height: '12px', width: '12px' }} />
                      {event.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button
              onClick={resetForm}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {editingId ? 'Update Ministry' : 'Create Ministry'}
            </button>
          </div>
        </div>
      )}

      {/* Ministry Cards Grid */}
      {filteredMinistries.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', paddingTop: '48px' }}>
          <Users
            style={{
              height: '48px',
              width: '48px',
              color: '#9B9590',
              margin: '0 auto 16px',
            }}
          />
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Ministries Yet</h3>
          <p style={{ color: '#9B9590' }}>Click &quot;Create Ministry&quot; to add your first ministry group.</p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {filteredMinistries.map((ministry) => {
          const linkedEvents = getLinkedEventNames(ministry.events);
          const isExpanded = expandedMembers[ministry.id];

          return (
            <div
              key={ministry.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${ministry.color || '#8b5cf6'}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '20px' }}>
                {/* Name and description */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        margin: '0 0 4px 0',
                        color: '#2D2A26',
                      }}
                    >
                      {ministry.name}
                    </h3>
                    {ministry.description && (
                      <p style={{ fontSize: '14px', color: '#9B9590', margin: 0 }}>{ministry.description}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(ministry)}
                      style={{
                        backgroundColor: '#7B2D4E',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Edit2 style={{ height: '12px', width: '12px' }} />
                      Manage
                    </button>
                    <button
                      onClick={() => handleDelete(ministry)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                      title="Delete Ministry"
                    >
                      <Trash2 style={{ height: '12px', width: '12px' }} />
                    </button>
                  </div>
                </div>

                {/* Leader */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#6B6560',
                  }}
                >
                  <Users style={{ height: '14px', width: '14px', color: '#9B9590' }} />
                  <span style={{ fontWeight: '500' }}>{ministry.leader}</span>
                  {ministry.leaderEmail && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail
                        style={{
                          height: '12px',
                          width: '12px',
                          color: '#9B9590',
                        }}
                      />
                      <span style={{ color: '#9B9590', fontSize: '13px' }}>{ministry.leaderEmail}</span>
                    </span>
                  )}
                </div>

                {/* Meeting schedule */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: '#6B6560',
                  }}
                >
                  <Calendar style={{ height: '14px', width: '14px', color: '#9B9590' }} />
                  <span>{ministry.meetingDay}</span>
                  <Clock style={{ height: '14px', width: '14px', color: '#9B9590' }} />
                  <span>{ministry.meetingTime}</span>
                </div>

                {/* Badges */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: '#f3e8ff',
                      color: '#7c3aed',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {(ministry.members || []).length} {(ministry.members || []).length === 1 ? 'member' : 'members'}
                  </span>
                  <span
                    style={{
                      backgroundColor: '#FAF5EF',
                      color: '#7B2D4E',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {linkedEvents.length} {linkedEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Linked events names */}
                {linkedEvents.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {linkedEvents.map((eventName, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#f0f9ff',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {eventName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expandable member list */}
                {(ministry.members || []).length > 0 && (
                  <div style={{ borderTop: '1px solid #F0E8DD', paddingTop: '8px' }}>
                    <button
                      onClick={() => toggleExpandMembers(ministry.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        color: '#9B9590',
                        padding: '4px 0',
                        fontWeight: '500',
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp style={{ height: '14px', width: '14px' }} />
                      ) : (
                        <ChevronDown style={{ height: '14px', width: '14px' }} />
                      )}
                      {isExpanded ? 'Hide members' : 'Show members'}
                    </button>
                    {isExpanded && (
                      <div style={{ marginTop: '8px' }}>
                        {ministry.members.map((member, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: '14px',
                              color: '#6B6560',
                              padding: '4px 0 4px 8px',
                              borderLeft: `2px solid ${ministry.color || '#8b5cf6'}`,
                              marginBottom: '4px',
                            }}
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MinistriesView;
