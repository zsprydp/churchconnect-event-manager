import { filterEvents, filterVolunteers, filterAttendees } from './filters';

const sampleEvents = [
  { id: 1, name: 'Youth Retreat', location: 'Camp Pine', status: 'active' },
  { id: 2, name: 'Food Drive', location: 'Church Hall', status: 'active' },
  { id: 3, name: 'Easter Service', location: 'Main Sanctuary', status: 'closed' },
];

const sampleVolunteers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', role: 'Coordinator' },
  { id: 2, name: 'Mike Chen', email: 'mike@email.com', role: 'Setup Team' },
];

const sampleAttendees = [
  { id: 1, primaryName: 'John Smith', email: 'john@email.com' },
  { id: 2, primaryName: 'Mary Johnson', email: 'mary@email.com' },
];

describe('filterEvents', () => {
  test('returns all events when no search term and filter is all', () => {
    const result = filterEvents(sampleEvents, '', 'all');
    expect(result).toHaveLength(3);
  });

  test('filters by name', () => {
    const result = filterEvents(sampleEvents, 'Youth', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Youth Retreat');
  });

  test('filters by location', () => {
    const result = filterEvents(sampleEvents, 'Church Hall', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Food Drive');
  });

  test('filters by status', () => {
    const result = filterEvents(sampleEvents, '', 'closed');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Easter Service');
  });

  test('combines search and status filter', () => {
    const result = filterEvents(sampleEvents, 'Service', 'closed');
    expect(result).toHaveLength(1);
  });

  test('returns empty when no match', () => {
    const result = filterEvents(sampleEvents, 'Christmas', 'all');
    expect(result).toHaveLength(0);
  });

  test('is case-insensitive', () => {
    const result = filterEvents(sampleEvents, 'youth', 'all');
    expect(result).toHaveLength(1);
  });
});

describe('filterVolunteers', () => {
  test('returns all when search is empty', () => {
    const result = filterVolunteers(sampleVolunteers, '');
    expect(result).toHaveLength(2);
  });

  test('filters by name', () => {
    const result = filterVolunteers(sampleVolunteers, 'Sarah');
    expect(result).toHaveLength(1);
  });

  test('filters by email', () => {
    const result = filterVolunteers(sampleVolunteers, 'mike@email.com');
    expect(result).toHaveLength(1);
  });

  test('filters by role', () => {
    const result = filterVolunteers(sampleVolunteers, 'Coordinator');
    expect(result).toHaveLength(1);
  });
});

describe('filterAttendees', () => {
  test('returns all when search is empty', () => {
    const result = filterAttendees(sampleAttendees, '');
    expect(result).toHaveLength(2);
  });

  test('filters by name', () => {
    const result = filterAttendees(sampleAttendees, 'Smith');
    expect(result).toHaveLength(1);
    expect(result[0].primaryName).toBe('John Smith');
  });

  test('filters by email', () => {
    const result = filterAttendees(sampleAttendees, 'mary@email.com');
    expect(result).toHaveLength(1);
  });
});
