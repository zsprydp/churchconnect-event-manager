export const filterEvents = (events, searchTerm, filterStatus) => {
  return events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
};

export const filterVolunteers = (volunteers, searchTerm) => {
  return volunteers.filter(
    (volunteer) =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const filterAttendees = (attendees, searchTerm) => {
  return attendees.filter(
    (attendee) =>
      attendee.primaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
