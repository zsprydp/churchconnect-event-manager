import React, { useState, useMemo } from 'react';
import { Heart, TrendingUp, Users, CalendarDays, DollarSign, Trophy, X } from 'lucide-react';

const AnalyticsView = ({ events, attendees, volunteers, donations, payments, addNotification }) => {
  const [dismissedIds, setDismissedIds] = useState([]);

  const totalEvents = useMemo(() => {
    return events.filter((e) => e.status === 'active' || e.status === 'closed').length;
  }, [events]);

  const totalRegistrations = useMemo(() => attendees.length, [attendees]);

  const activeVolunteers = useMemo(() => volunteers.length, [volunteers]);

  const totalGiving = useMemo(() => {
    return donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  }, [donations]);

  const registrationsByEvent = useMemo(() => {
    const counts = {};
    attendees.forEach((a) => {
      counts[a.eventId] = (counts[a.eventId] || 0) + 1;
    });
    return events
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        count: counts[e.id] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [events, attendees]);

  const maxRegistrations = useMemo(() => {
    return Math.max(1, ...registrationsByEvent.map((e) => e.count));
  }, [registrationsByEvent]);

  const careList = useMemo(() => {
    return attendees
      .filter((a) => !a.checkedIn && !dismissedIds.includes(a.id))
      .map((a) => {
        const event = events.find((e) => e.id === a.eventId);
        const regDate = new Date(a.registrationDate);
        const daysSince = Math.floor((Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...a,
          eventName: event ? event.name : 'Unknown Event',
          daysSince,
        };
      })
      .sort((a, b) => b.daysSince - a.daysSince);
  }, [attendees, events, dismissedIds]);

  const volunteerLeaderboard = useMemo(() => {
    return volunteers
      .map((v) => {
        const eventCount = events.filter((e) => e.volunteers && e.volunteers.includes(v.id)).length;
        return { ...v, eventCount };
      })
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5);
  }, [volunteers, events]);

  const maxVolunteerEvents = useMemo(() => {
    return Math.max(1, ...volunteerLeaderboard.map((v) => v.eventCount));
  }, [volunteerLeaderboard]);

  const handleReachOut = (person) => {
    addNotification(
      `We miss you, ${person.primaryName}! A "We Miss You" message has been queued for ${person.email}.`,
      'info'
    );
  };

  const handleDismiss = (id) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const getRankColor = (index) => {
    if (index === 0) return '#f59e0b';
    if (index === 1) return '#9ca3af';
    if (index === 2) return '#cd7f32';
    return '#6b7280';
  };

  const getRankLabel = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <TrendingUp style={{ height: '28px', width: '28px', color: '#2563eb' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Analytics</h2>
      </div>

      {/* Section A: Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {[
          {
            label: 'Total Events',
            value: totalEvents,
            icon: CalendarDays,
            color: '#2563eb',
          },
          {
            label: 'Total Registrations',
            value: totalRegistrations,
            icon: Users,
            color: '#7c3aed',
          },
          {
            label: 'Active Volunteers',
            value: activeVolunteers,
            icon: Users,
            color: '#059669',
          },
          {
            label: 'Total Giving',
            value: `$${totalGiving.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: '#d97706',
          },
        ].map((metric) => (
          <div
            key={metric.label}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>{metric.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{metric.value}</p>
              </div>
              <div
                style={{
                  backgroundColor: `${metric.color}15`,
                  borderRadius: '8px',
                  padding: '8px',
                }}
              >
                <metric.icon style={{ height: '20px', width: '20px', color: metric.color }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Section B: Attendance Trends */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          marginBottom: '32px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
          Attendance Trends — Registrations per Event
        </h3>
        {registrationsByEvent.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px 0' }}>No event data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {registrationsByEvent.map((ev) => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#374151',
                    width: '180px',
                    flexShrink: 0,
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={ev.name}
                >
                  {ev.name}
                </span>
                <div style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: '6px', height: '28px' }}>
                  <div
                    style={{
                      width: `${(ev.count / maxRegistrations) * 100}%`,
                      minWidth: ev.count > 0 ? '4px' : '0',
                      backgroundColor: ev.status === 'active' ? '#3b82f6' : '#9ca3af',
                      height: '100%',
                      borderRadius: '6px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827', minWidth: '30px' }}>
                  {ev.count}
                </span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: '#3b82f6',
              }}
            />
            Active Events
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: '#9ca3af',
              }}
            />
            Closed Events
          </span>
        </div>
      </div>

      {/* Section C: Care List */}
      <div
        style={{
          backgroundColor: '#fff5f5',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #fecaca',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Heart style={{ height: '22px', width: '22px', color: '#dc2626' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#991b1b' }}>
            Care List &mdash; Members Needing Attention
          </h3>
        </div>

        {careList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Heart style={{ height: '40px', width: '40px', color: '#10b981', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#065f46' }}>
              Everyone is engaged! No members need follow-up.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {careList.map((person) => (
              <div
                key={person.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontWeight: '600', fontSize: '15px', margin: '0 0 4px 0', color: '#111827' }}>
                    {person.primaryName}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px 0' }}>{person.email}</p>
                  {person.phone && (
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px 0' }}>{person.phone}</p>
                  )}
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    Last event: <strong>{person.eventName}</strong> &middot; {person.daysSince} days ago
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleReachOut(person)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    Reach Out
                  </button>
                  <button
                    onClick={() => handleDismiss(person.id)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <X style={{ height: '14px', width: '14px' }} />
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section D: Volunteer Leaderboard */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Trophy style={{ height: '22px', width: '22px', color: '#f59e0b' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Volunteer Leaderboard</h3>
        </div>

        {volunteerLeaderboard.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '24px 0' }}>No volunteer data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {volunteerLeaderboard.map((vol, index) => (
              <div
                key={vol.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  backgroundColor:
                    index === 0 ? '#fffbeb' : index === 1 ? '#f9fafb' : index === 2 ? '#fdf4e8' : 'white',
                  borderRadius: '8px',
                  border: `1px solid ${index < 3 ? '#e5e7eb' : '#f3f4f6'}`,
                }}
              >
                <span style={{ fontSize: '20px', width: '32px', textAlign: 'center' }}>{getRankLabel(index)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '15px', margin: '0 0 2px 0', color: '#111827' }}>
                    {vol.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{vol.role}</p>
                </div>
                <div style={{ width: '120px', flexShrink: 0 }}>
                  <div style={{ backgroundColor: '#f3f4f6', borderRadius: '4px', height: '8px' }}>
                    <div
                      style={{
                        width: `${(vol.eventCount / maxVolunteerEvents) * 100}%`,
                        minWidth: vol.eventCount > 0 ? '4px' : '0',
                        backgroundColor: getRankColor(index),
                        height: '100%',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: getRankColor(index),
                    minWidth: '50px',
                    textAlign: 'right',
                  }}
                >
                  {vol.eventCount} {vol.eventCount === 1 ? 'event' : 'events'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsView;
