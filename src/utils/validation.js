export const validateEventForm = (eventData) => {
  const errors = {};
  if (!eventData.name?.trim()) errors.name = 'Event name is required';
  if (eventData.capacity && parseInt(eventData.capacity) < 1) errors.capacity = 'Capacity must be at least 1';
  if (eventData.registrationFee && parseFloat(eventData.registrationFee) < 0)
    errors.registrationFee = 'Fee cannot be negative';
  if (eventData.dateType === 'single' && (!eventData.dates[0] || eventData.dates[0] === ''))
    errors.date = 'Date is required';
  return errors;
};

export const validateVolunteerForm = (volunteerData) => {
  const errors = {};
  if (!volunteerData.name?.trim()) errors.name = 'Name is required';
  if (!volunteerData.email?.trim()) errors.email = 'Email is required';
  if (volunteerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(volunteerData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  return errors;
};

export const validateAttendeeForm = (attendeeData) => {
  const errors = {};
  if (!attendeeData.primaryName?.trim()) errors.primaryName = 'Name is required';
  if (!attendeeData.email?.trim()) errors.email = 'Email is required';
  if (attendeeData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  return errors;
};
