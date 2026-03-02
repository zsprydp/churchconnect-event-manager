import { validateEventForm, validateVolunteerForm, validateAttendeeForm } from './validation';

describe('validateEventForm', () => {
  test('returns error when name is empty', () => {
    const errors = validateEventForm({ name: '', dates: [''], dateType: 'single' });
    expect(errors.name).toBe('Event name is required');
  });

  test('returns error when name is whitespace', () => {
    const errors = validateEventForm({ name: '   ', dates: ['2025-01-01'], dateType: 'single' });
    expect(errors.name).toBe('Event name is required');
  });

  test('returns error when capacity is less than 1', () => {
    const errors = validateEventForm({ name: 'Test', capacity: '0', dates: ['2025-01-01'], dateType: 'single' });
    expect(errors.capacity).toBe('Capacity must be at least 1');
  });

  test('returns error when registration fee is negative', () => {
    const errors = validateEventForm({
      name: 'Test',
      registrationFee: '-5',
      dates: ['2025-01-01'],
      dateType: 'single',
    });
    expect(errors.registrationFee).toBe('Fee cannot be negative');
  });

  test('returns error when single date is empty', () => {
    const errors = validateEventForm({ name: 'Test', dateType: 'single', dates: [''] });
    expect(errors.date).toBe('Date is required');
  });

  test('returns no errors for valid event', () => {
    const errors = validateEventForm({
      name: 'Sunday Service',
      dateType: 'single',
      dates: ['2025-06-01'],
      capacity: '100',
      registrationFee: '0',
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('skips date check for recurring events', () => {
    const errors = validateEventForm({
      name: 'Weekly Service',
      dateType: 'recurring',
      dates: [],
    });
    expect(errors.date).toBeUndefined();
  });
});

describe('validateVolunteerForm', () => {
  test('returns error when name is empty', () => {
    const errors = validateVolunteerForm({ name: '', email: 'test@example.com' });
    expect(errors.name).toBe('Name is required');
  });

  test('returns error when email is empty', () => {
    const errors = validateVolunteerForm({ name: 'John', email: '' });
    expect(errors.email).toBe('Email is required');
  });

  test('returns error for invalid email', () => {
    const errors = validateVolunteerForm({ name: 'John', email: 'not-an-email' });
    expect(errors.email).toBe('Please enter a valid email address');
  });

  test('returns no errors for valid volunteer', () => {
    const errors = validateVolunteerForm({ name: 'John', email: 'john@example.com' });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

describe('validateAttendeeForm', () => {
  test('returns error when primaryName is empty', () => {
    const errors = validateAttendeeForm({ primaryName: '', email: 'test@example.com' });
    expect(errors.primaryName).toBe('Name is required');
  });

  test('returns error when email is empty', () => {
    const errors = validateAttendeeForm({ primaryName: 'John', email: '' });
    expect(errors.email).toBe('Email is required');
  });

  test('returns error for invalid email', () => {
    const errors = validateAttendeeForm({ primaryName: 'John', email: 'bad' });
    expect(errors.email).toBe('Please enter a valid email address');
  });

  test('returns no errors for valid attendee', () => {
    const errors = validateAttendeeForm({ primaryName: 'John', email: 'john@example.com' });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});
