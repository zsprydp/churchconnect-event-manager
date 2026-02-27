import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  X,
  Users,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Building,
  Package,
  Filter,
  Trash2,
} from 'lucide-react';

const ALL_AMENITIES = [
  'Sound System',
  'Projector',
  'Stage',
  'Kitchen Access',
  'Tables',
  'Whiteboard',
  'TV',
  'Gaming Console',
  'Couches',
  'Piano',
];

const RESOURCE_CATEGORIES = ['AV', 'Vehicle', 'Furniture', 'Kitchen'];

const BookingsView = ({
  rooms,
  setRooms,
  resources,
  setResources,
  roomBookings,
  setRoomBookings,
  events,
  addNotification,
}) => {
  const [subTab, setSubTab] = useState('rooms');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [weekOffset, setWeekOffset] = useState(0);

  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    floor: '1st',
    amenities: [],
    color: '#3b82f6',
  });

  const [newResource, setNewResource] = useState({
    name: '',
    category: 'AV',
    quantity: 1,
  });

  const [newBooking, setNewBooking] = useState({
    roomId: '',
    eventId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    resources: [],
  });

  const hasConflict = useCallback(
    (roomId, date, startTime, endTime, excludeBookingId) => {
      return roomBookings.some((b) => {
        if (b.roomId !== roomId || b.date !== date) return false;
        if (excludeBookingId && b.id === excludeBookingId) return false;
        return b.startTime < endTime && b.endTime > startTime;
      });
    },
    [roomBookings]
  );

  const getRoomBookings = useCallback((roomId) => roomBookings.filter((b) => b.roomId === roomId), [roomBookings]);

  const roomHasAnyConflict = useCallback(
    (roomId) => {
      const bookings = getRoomBookings(roomId);
      for (let i = 0; i < bookings.length; i++) {
        for (let j = i + 1; j < bookings.length; j++) {
          if (
            bookings[i].date === bookings[j].date &&
            bookings[i].startTime < bookings[j].endTime &&
            bookings[i].endTime > bookings[j].startTime
          ) {
            return true;
          }
        }
      }
      return false;
    },
    [getRoomBookings]
  );

  const handleAddRoom = useCallback(() => {
    if (!newRoom.name.trim()) {
      addNotification('Please enter a room name', 'error');
      return;
    }
    if (!newRoom.capacity || parseInt(newRoom.capacity) <= 0) {
      addNotification('Please enter a valid capacity', 'error');
      return;
    }
    const room = {
      id: Date.now(),
      name: newRoom.name.trim(),
      capacity: parseInt(newRoom.capacity),
      floor: newRoom.floor,
      amenities: newRoom.amenities,
      color: newRoom.color,
    };
    setRooms((prev) => [...prev, room]);
    setNewRoom({ name: '', capacity: '', floor: '1st', amenities: [], color: '#3b82f6' });
    setShowAddRoom(false);
    addNotification('Room added successfully!', 'success');
  }, [newRoom, setRooms, addNotification]);

  const handleDeleteRoom = useCallback(
    (roomId) => {
      if (window.confirm('Delete this room? Associated bookings will also be removed.')) {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        setRoomBookings((prev) => prev.filter((b) => b.roomId !== roomId));
        addNotification('Room deleted', 'success');
      }
    },
    [setRooms, setRoomBookings, addNotification]
  );

  const handleAddResource = useCallback(() => {
    if (!newResource.name.trim()) {
      addNotification('Please enter a resource name', 'error');
      return;
    }
    const resource = {
      id: Date.now(),
      name: newResource.name.trim(),
      category: newResource.category,
      quantity: parseInt(newResource.quantity) || 1,
      available: parseInt(newResource.quantity) || 1,
    };
    setResources((prev) => [...prev, resource]);
    setNewResource({ name: '', category: 'AV', quantity: 1 });
    setShowAddResource(false);
    addNotification('Resource added successfully!', 'success');
  }, [newResource, setResources, addNotification]);

  const handleReserve = useCallback(
    (resourceId) => {
      setResources((prev) =>
        prev.map((r) => {
          if (r.id === resourceId && r.available > 0) {
            return { ...r, available: r.available - 1 };
          }
          return r;
        })
      );
    },
    [setResources]
  );

  const handleReturn = useCallback(
    (resourceId) => {
      setResources((prev) =>
        prev.map((r) => {
          if (r.id === resourceId && r.available < r.quantity) {
            return { ...r, available: r.available + 1 };
          }
          return r;
        })
      );
    },
    [setResources]
  );

  const handleAddBooking = useCallback(() => {
    const roomId = parseInt(newBooking.roomId);
    const eventId = parseInt(newBooking.eventId);
    if (!roomId || !eventId || !newBooking.date) {
      addNotification('Please fill in all booking fields', 'error');
      return;
    }
    if (newBooking.startTime >= newBooking.endTime) {
      addNotification('End time must be after start time', 'error');
      return;
    }
    if (hasConflict(roomId, newBooking.date, newBooking.startTime, newBooking.endTime)) {
      addNotification('Conflict: this room is already booked for overlapping times on this date!', 'error');
      return;
    }
    const event = events.find((e) => e.id === eventId);
    const booking = {
      id: Date.now(),
      roomId,
      eventId,
      eventName: event ? event.name : 'Unknown Event',
      date: newBooking.date,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      resources: newBooking.resources.map(Number),
    };
    setRoomBookings((prev) => [...prev, booking]);
    setNewBooking({ roomId: '', eventId: '', date: '', startTime: '09:00', endTime: '17:00', resources: [] });
    setShowAddBooking(false);
    addNotification('Booking created successfully!', 'success');
  }, [newBooking, events, hasConflict, setRoomBookings, addNotification]);

  const handleDeleteBooking = useCallback(
    (bookingId) => {
      setRoomBookings((prev) => prev.filter((b) => b.id !== bookingId));
      addNotification('Booking removed', 'success');
    },
    [setRoomBookings, addNotification]
  );

  const filteredResources = useMemo(() => {
    if (categoryFilter === 'All') return resources;
    return resources.filter((r) => r.category === categoryFilter);
  }, [resources, categoryFilter]);

  const getWeekDates = useCallback((offset) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [getWeekDates, weekOffset]);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formatDate = (d) => d.toISOString().split('T')[0];

  const getBookingsForDateAndRoom = useCallback(
    (date, roomId) => {
      const dateStr = formatDate(date);
      return roomBookings.filter((b) => b.date === dateStr && b.roomId === roomId);
    },
    [roomBookings]
  );

  const isConflictOnDate = useCallback(
    (date, roomId) => {
      const dayBookings = getBookingsForDateAndRoom(date, roomId);
      for (let i = 0; i < dayBookings.length; i++) {
        for (let j = i + 1; j < dayBookings.length; j++) {
          if (dayBookings[i].startTime < dayBookings[j].endTime && dayBookings[i].endTime > dayBookings[j].startTime) {
            return true;
          }
        }
      }
      return false;
    },
    [getBookingsForDateAndRoom]
  );

  const toggleAmenity = (amenity) => {
    setNewRoom((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const toggleBookingResource = (resId) => {
    setNewBooking((prev) => ({
      ...prev,
      resources: prev.resources.includes(resId)
        ? prev.resources.filter((r) => r !== resId)
        : [...prev.resources, resId],
    }));
  };

  const utilizationColor = (available, total) => {
    if (total === 0) return '#6b7280';
    const ratio = available / total;
    if (ratio > 0.5) return '#10b981';
    if (ratio > 0) return '#f59e0b';
    return '#ef4444';
  };

  const categoryBadgeColor = (cat) => {
    switch (cat) {
      case 'AV':
        return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'Vehicle':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'Furniture':
        return { bg: '#ede9fe', text: '#7c3aed' };
      case 'Kitchen':
        return { bg: '#fce7f3', text: '#be185d' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const ROOM_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#06b6d4', '#f97316'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Room &amp; Resource Booking</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            {rooms.length} rooms • {resources.length} resources • {roomBookings.length} bookings
          </p>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0',
        }}
      >
        {[
          { id: 'rooms', label: 'Rooms', icon: Building },
          { id: 'resources', label: 'Resources', icon: Package },
          { id: 'calendar', label: 'Availability Calendar', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              border: 'none',
              borderBottom: subTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: subTab === tab.id ? '#2563eb' : '#6b7280',
              fontWeight: subTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '-2px',
            }}
          >
            <tab.icon style={{ height: '16px', width: '16px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB A: ROOMS */}
      {subTab === 'rooms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => setShowAddRoom(!showAddRoom)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              Add Room
            </button>
          </div>

          {/* Inline add room form */}
          {showAddRoom && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>New Room</h3>
                <button
                  onClick={() => setShowAddRoom(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  <X style={{ height: '20px', width: '20px' }} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Name *
                  </label>
                  <input
                    value={newRoom.name}
                    onChange={(e) => setNewRoom((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Room name"
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
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom((p) => ({ ...p, capacity: e.target.value }))}
                    placeholder="50"
                    min="1"
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
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Floor
                  </label>
                  <select
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom((p) => ({ ...p, floor: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="1st">1st</option>
                    <option value="2nd">2nd</option>
                    <option value="3rd">3rd</option>
                    <option value="Basement">Basement</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: '#374151',
                  }}
                >
                  Color
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {ROOM_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewRoom((p) => ({ ...p, color: c }))}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: newRoom.color === c ? '3px solid #111827' : '2px solid #e5e7eb',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: '#374151',
                  }}
                >
                  Amenities
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ALL_AMENITIES.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: newRoom.amenities.includes(a) ? '#2563eb' : '#d1d5db',
                        backgroundColor: newRoom.amenities.includes(a) ? '#dbeafe' : 'white',
                        color: newRoom.amenities.includes(a) ? '#1d4ed8' : '#374151',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddRoom}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Create Room
              </button>
            </div>
          )}

          {/* Room grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {rooms.map((room) => {
              const bookings = getRoomBookings(room.id);
              const conflict = roomHasAnyConflict(room.id);
              return (
                <div
                  key={room.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: conflict ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ height: '4px', backgroundColor: room.color }} />
                  <div style={{ padding: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{room.name}</h3>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: conflict ? '#ef4444' : '#10b981',
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                          title={conflict ? 'Has booking conflicts' : 'No conflicts'}
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          padding: '2px',
                        }}
                        title="Delete room"
                      >
                        <Trash2 style={{ height: '16px', width: '16px' }} />
                      </button>
                    </div>
                    <div
                      style={{ display: 'flex', gap: '12px', marginBottom: '10px', color: '#6b7280', fontSize: '13px' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users style={{ height: '14px', width: '14px' }} />
                        {room.capacity}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ height: '14px', width: '14px' }} />
                        {room.floor} Floor
                      </span>
                    </div>
                    {room.amenities && room.amenities.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                        {room.amenities.map((a) => (
                          <span
                            key={a}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: `${room.color}15`,
                              color: room.color,
                              fontSize: '11px',
                              fontWeight: '500',
                            }}
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    {bookings.length > 0 ? (
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                          Bookings ({bookings.length})
                        </p>
                        {bookings.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            style={{
                              fontSize: '12px',
                              padding: '4px 8px',
                              backgroundColor: '#f9fafb',
                              borderRadius: '4px',
                              marginBottom: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>
                              {b.eventName} — {b.date} {b.startTime}-{b.endTime}
                            </span>
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                padding: '0 2px',
                              }}
                              title="Remove booking"
                            >
                              <X style={{ height: '12px', width: '12px' }} />
                            </button>
                          </div>
                        ))}
                        {bookings.length > 3 && (
                          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                            +{bookings.length - 3} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>No bookings</p>
                    )}
                    {conflict && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '8px',
                          padding: '4px 8px',
                          backgroundColor: '#fef2f2',
                          borderRadius: '6px',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: '500',
                        }}
                      >
                        <AlertTriangle style={{ height: '14px', width: '14px' }} />
                        Booking conflict detected
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {rooms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              <Building style={{ height: '48px', width: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Rooms Yet</h3>
              <p>Add your first room to start managing bookings</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB B: RESOURCES */}
      {subTab === 'resources' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter style={{ height: '16px', width: '16px', color: '#6b7280' }} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                }}
              >
                <option value="All">All Categories</option>
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddResource(!showAddResource)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              Add Resource
            </button>
          </div>

          {/* Inline add resource form */}
          {showAddResource && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>New Resource</h3>
                <button
                  onClick={() => setShowAddResource(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  <X style={{ height: '20px', width: '20px' }} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Name *
                  </label>
                  <input
                    value={newResource.name}
                    onChange={(e) => setNewResource((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Resource name"
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
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource((p) => ({ ...p, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newResource.quantity}
                    onChange={(e) => setNewResource((p) => ({ ...p, quantity: e.target.value }))}
                    min="1"
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
              <button
                onClick={handleAddResource}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Create Resource
              </button>
            </div>
          )}

          {/* Resources table */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Total
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Available
                  </th>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      minWidth: '120px',
                    }}
                  >
                    Utilization
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => {
                  const used = resource.quantity - resource.available;
                  const pct = resource.quantity > 0 ? (used / resource.quantity) * 100 : 0;
                  const badge = categoryBadgeColor(resource.category);
                  return (
                    <tr key={resource.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{resource.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '2px 10px',
                            borderRadius: '12px',
                            backgroundColor: badge.bg,
                            color: badge.text,
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {resource.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px' }}>
                        {resource.quantity}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: utilizationColor(resource.available, resource.quantity),
                        }}
                      >
                        {resource.available}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              backgroundColor: '#e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                backgroundColor: utilizationColor(resource.available, resource.quantity),
                                borderRadius: '4px',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '32px' }}>
                            {Math.round(pct)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleReserve(resource.id)}
                            disabled={resource.available === 0}
                            style={{
                              padding: '4px 10px',
                              border: 'none',
                              borderRadius: '6px',
                              backgroundColor: resource.available > 0 ? '#2563eb' : '#e5e7eb',
                              color: resource.available > 0 ? 'white' : '#9ca3af',
                              cursor: resource.available > 0 ? 'pointer' : 'not-allowed',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Reserve
                          </button>
                          <button
                            onClick={() => handleReturn(resource.id)}
                            disabled={resource.available === resource.quantity}
                            style={{
                              padding: '4px 10px',
                              border: '1px solid',
                              borderColor: resource.available < resource.quantity ? '#d1d5db' : '#e5e7eb',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              color: resource.available < resource.quantity ? '#374151' : '#9ca3af',
                              cursor: resource.available < resource.quantity ? 'pointer' : 'not-allowed',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Return
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredResources.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                <Package style={{ height: '36px', width: '36px', margin: '0 auto 12px', color: '#9ca3af' }} />
                <p style={{ margin: 0 }}>No resources found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB C: AVAILABILITY CALENDAR */}
      {subTab === 'calendar' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setWeekOffset((p) => p - 1)}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft style={{ height: '16px', width: '16px' }} />
              </button>
              <span style={{ fontSize: '15px', fontWeight: '600', minWidth: '200px', textAlign: 'center' }}>
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button
                onClick={() => setWeekOffset((p) => p + 1)}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight style={{ height: '16px', width: '16px' }} />
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#374151',
                  }}
                >
                  Today
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAddBooking(!showAddBooking)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              <Plus style={{ height: '16px', width: '16px' }} />
              New Booking
            </button>
          </div>

          {/* Add booking form */}
          {showAddBooking && (
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>New Booking</h3>
                <button
                  onClick={() => setShowAddBooking(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                >
                  <X style={{ height: '20px', width: '20px' }} />
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Room *
                  </label>
                  <select
                    value={newBooking.roomId}
                    onChange={(e) => setNewBooking((p) => ({ ...p, roomId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select room</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Event *
                  </label>
                  <select
                    value={newBooking.eventId}
                    onChange={(e) => setNewBooking((p) => ({ ...p, eventId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select event</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking((p) => ({ ...p, date: e.target.value }))}
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
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    Start
                  </label>
                  <input
                    type="time"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking((p) => ({ ...p, startTime: e.target.value }))}
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
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#374151',
                    }}
                  >
                    End
                  </label>
                  <input
                    type="time"
                    value={newBooking.endTime}
                    onChange={(e) => setNewBooking((p) => ({ ...p, endTime: e.target.value }))}
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
              {resources.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '6px',
                      color: '#374151',
                    }}
                  >
                    Resources (optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {resources.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => toggleBookingResource(r.id)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '16px',
                          border: '1px solid',
                          borderColor: newBooking.resources.includes(r.id) ? '#2563eb' : '#d1d5db',
                          backgroundColor: newBooking.resources.includes(r.id) ? '#dbeafe' : 'white',
                          color: newBooking.resources.includes(r.id) ? '#1d4ed8' : '#374151',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                        }}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={handleAddBooking}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Create Booking
              </button>
            </div>
          )}

          {/* Calendar grid */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151',
                      width: '120px',
                      borderRight: '1px solid #e5e7eb',
                    }}
                  >
                    Room
                  </th>
                  {weekDates.map((d, i) => {
                    const isToday = formatDate(d) === formatDate(new Date());
                    return (
                      <th
                        key={i}
                        style={{
                          textAlign: 'center',
                          padding: '12px 8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: isToday ? '#2563eb' : '#374151',
                          backgroundColor: isToday ? '#eff6ff' : '#f9fafb',
                          borderRight: i < 6 ? '1px solid #e5e7eb' : 'none',
                        }}
                      >
                        <div>{dayNames[i]}</div>
                        <div style={{ fontSize: '11px', fontWeight: '400', color: isToday ? '#2563eb' : '#6b7280' }}>
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        borderRight: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        verticalAlign: 'top',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: room.color,
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
                        {room.name}
                      </div>
                    </td>
                    {weekDates.map((d, i) => {
                      const dayBookings = getBookingsForDateAndRoom(d, room.id);
                      const conflict = isConflictOnDate(d, room.id);
                      return (
                        <td
                          key={i}
                          style={{
                            padding: '6px',
                            verticalAlign: 'top',
                            borderRight: i < 6 ? '1px solid #e5e7eb' : 'none',
                            backgroundColor: conflict ? '#fef2f2' : 'white',
                            minHeight: '60px',
                          }}
                        >
                          {dayBookings.map((b) => (
                            <div
                              key={b.id}
                              style={{
                                padding: '3px 6px',
                                borderRadius: '4px',
                                backgroundColor: conflict ? '#fecaca' : `${room.color}20`,
                                borderLeft: `3px solid ${conflict ? '#ef4444' : room.color}`,
                                marginBottom: '3px',
                                fontSize: '11px',
                                lineHeight: '1.3',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {conflict && (
                                  <AlertTriangle
                                    style={{ height: '10px', width: '10px', color: '#ef4444', flexShrink: 0 }}
                                  />
                                )}
                                <span
                                  style={{
                                    fontWeight: '600',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {b.eventName}
                                </span>
                              </div>
                              <div style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <Clock style={{ height: '9px', width: '9px' }} />
                                {b.startTime}-{b.endTime}
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {rooms.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                <Calendar style={{ height: '36px', width: '36px', margin: '0 auto 12px', color: '#9ca3af' }} />
                <p style={{ margin: 0 }}>Add rooms to see the availability calendar</p>
              </div>
            )}
          </div>

          {/* Legend */}
          {rooms.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
              }}
            >
              {rooms.map((r) => (
                <div
                  key={r.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151' }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      backgroundColor: r.color,
                      display: 'inline-block',
                    }}
                  />
                  {r.name}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#dc2626' }}>
                <AlertTriangle style={{ height: '12px', width: '12px' }} />
                Conflict
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingsView;
