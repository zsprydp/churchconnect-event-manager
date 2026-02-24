import React, { useState, useCallback, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Mail, Plus, Settings, BarChart3, CreditCard, X, User, CheckCircle, Edit2, Trash2, Shield, Search } from 'lucide-react';
import Calendar from './Calendar';
import OfflineIndicator from './components/OfflineIndicator';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storage';
import { validateEventForm, validateVolunteerForm, validateAttendeeForm } from './utils/validation';
import { filterEvents, filterVolunteers, filterAttendees } from './utils/filters';
import { mockEmailService, enhancedMessageTemplates } from './services/emailService';
import EventsView from './views/EventsView';
import CommunicationsView from './views/CommunicationsView';
import PaymentsView from './views/PaymentsView';
import SettingsView from './views/SettingsView';
import EventTemplateCreationModal from './components/modals/EventTemplateCreationModal';
import CreateEventModal from './components/modals/CreateEventModal';
import EditEventModal from './components/modals/EditEventModal';
import AddVolunteerModal from './components/modals/AddVolunteerModal';
import EventRegistrationModal from './components/modals/EventRegistrationModal';
import EditAttendeeModal from './components/modals/EditAttendeeModal';
import ManageEventModal from './components/modals/ManageEventModal';
import SendMessageModal from './components/modals/SendMessageModal';
import PaymentProcessingModal from './components/modals/PaymentProcessingModal';
import CreateTemplateModal from './components/modals/CreateTemplateModal';

const ChurchConnectDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Notification system
  const [notifications, setNotifications] = useState([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateEventTemplate, setShowCreateEventTemplate] = useState(false);
  const [newEventTemplate, setNewEventTemplate] = useState({
    name: '',
    eventType: '',
    customQuestions: []
  });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    message: '',
    type: 'announcement'
  });

  // Add notification function
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Remove notification function
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formErrors, setFormErrors] = useState({});
  
  // Event templates
  const [eventTemplates, setEventTemplates] = useState({
    'dinner': {
      name: 'Community Dinner',
      eventType: 'dinner',
      customQuestions: [
        { id: 'dietary', question: 'Dietary restrictions?', type: 'text', required: false },
        { id: 'childcare', question: 'Childcare needed?', type: 'yes/no', required: true }
      ]
    },
    'feast': {
      name: 'Feast Celebration',
      eventType: 'feast',
      customQuestions: [
        { id: 'attending', question: 'Number of family members attending?', type: 'number', required: true },
        { id: 'bringing', question: 'What dish will you bring?', type: 'text', required: false }
      ]
    },
    'retreat': {
      name: 'Spiritual Retreat',
      eventType: 'retreat',
      customQuestions: [
        { id: 'roommate', question: 'Roommate preference?', type: 'text', required: false },
        { id: 'transport', question: 'Need transportation?', type: 'yes/no', required: true }
      ]
    },
    'service': {
      name: 'Worship Service',
      eventType: 'service',
      customQuestions: [
        { id: 'childcare', question: 'Children attending?', type: 'yes/no', required: false }
      ]
    }
  });

  // State for events with enhanced date handling
  const [events, setEvents] = useState(() => loadFromLocalStorage('events', [
    {
      id: 1,
      name: 'Youth Summer Retreat',
      dateType: 'single',
      dates: ['2025-08-15'],
      startTime: '08:00',
      endTime: '22:00',
      recurrencePattern: null,
      location: 'Camp Pine Ridge',
      capacity: 60,
      registrationFee: 75,
      donationGoal: 3000,
      donations: 2850,
      volunteers: [1, 2],
      status: 'active',
      eventType: 'retreat',
      customQuestions: [
        { id: 'roommate', question: 'Roommate preference?', type: 'text', required: false },
        { id: 'transport', question: 'Need transportation?', type: 'yes/no', required: true }
      ]
    },
    {
      id: 2,
      name: 'Community Food Drive',
      dateType: 'recurring',
      dates: [],
      startTime: '09:00',
      endTime: '17:00',
      recurrencePattern: '4th Tuesday of each month',
      location: 'Church Fellowship Hall',
      capacity: 50,
      registrationFee: 0,
      donationGoal: 2000,
      donations: 1200,
      volunteers: [3],
      status: 'active',
      eventType: 'service',
      customQuestions: [
        { id: 'shifts', question: 'Preferred shift?', type: 'select', options: ['Morning', 'Afternoon', 'Evening'], required: true }
      ]
    },
    {
      id: 3,
      name: 'Easter Celebration',
      dateType: 'single',
      dates: ['2025-04-20'],
      startTime: '10:00',
      endTime: '14:00',
      recurrencePattern: null,
      location: 'Main Sanctuary',
      capacity: 200,
      registrationFee: 0,
      donationGoal: 5000,
      donations: 3200,
      volunteers: [],
      status: 'closed',
      eventType: 'service',
      customQuestions: []
    }
  ]));

  // State for volunteers with security levels
  const [volunteers, setVolunteers] = useState(() => loadFromLocalStorage('volunteers', [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0123', role: 'Event Coordinator', securityLevel: 'admin' },
    { id: 2, name: 'Mike Chen', email: 'mike@email.com', phone: '555-0124', role: 'Setup Team', securityLevel: 'volunteer' },
    { id: 3, name: 'Lisa Brown', email: 'lisa@email.com', phone: '555-0125', role: 'Registration', securityLevel: 'volunteer' }
  ]));

  // Enhanced attendee registrations with groups and custom responses
  const [attendees, setAttendees] = useState(() => loadFromLocalStorage('attendees', [
    { 
      id: 1, 
      eventId: 1, 
      primaryName: 'John Smith',
      email: 'john@email.com', 
      phone: '555-1001', 
      registrationDate: '2025-08-01', 
      checkedIn: false, 
      paymentStatus: 'paid',
      groupMembers: [
        { name: 'Jane Smith', relationship: 'Spouse', checkedIn: false },
        { name: 'Tim Smith', relationship: 'Child', checkedIn: false }
      ],
      customResponses: {
        'roommate': 'No preference',
        'transport': 'yes'
      }
    },
    { 
      id: 2, 
      eventId: 1, 
      primaryName: 'Mary Johnson',
      email: 'mary@email.com', 
      phone: '555-1002', 
      registrationDate: '2025-08-02', 
      checkedIn: true, 
      paymentStatus: 'paid',
      groupMembers: [],
      customResponses: {
        'roommate': 'Lisa Brown',
        'transport': 'no'
      }
    },
    {
      id: 3,
      eventId: 2,
      primaryName: 'Robert Wilson',
      email: 'robert@email.com',
      phone: '555-1003',
      registrationDate: '2025-08-03',
      checkedIn: false,
      paymentStatus: 'free',
      groupMembers: [
        { name: 'Emily Wilson', relationship: 'Spouse', checkedIn: false }
      ],
      customResponses: {
        'shifts': 'Morning'
      }
    }
  ]));

  // State for communications
  const [communications, setCommunications] = useState(() => loadFromLocalStorage('communications', [
    {
      id: 1,
      type: 'announcement',
      subject: 'Youth Retreat Registration Open',
      message: 'Registration is now open for our Youth Summer Retreat! Sign up today.',
      recipients: 'All Volunteers',
      sentDate: '2025-08-01',
      sentBy: 'Admin',
      recipientCount: 3
    },
    {
      id: 2,
      type: 'reminder',
      subject: 'Food Drive Tomorrow',
      message: 'Don\'t forget about our monthly food drive tomorrow. Please arrive 30 minutes early.',
      recipients: 'Food Drive Volunteers',
      sentDate: '2025-08-05',
      sentBy: 'Admin',
      recipientCount: 1
    }
  ]));

  // State for automated notifications settings
  const [notificationSettings, setNotificationSettings] = useState({
    registrationConfirmation: true,
    volunteerReminders: true,
    donationThankYou: true,
    eventUpdates: false,
    checkInConfirmation: true
  });

  // State for modals
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [showManageEvent, setShowManageEvent] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [showEditAttendee, setShowEditAttendee] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [manageEventTab, setManageEventTab] = useState('volunteers');
  const [communicationsTab, setCommunicationsTab] = useState('compose');
  const [showArchivedEvents, setShowArchivedEvents] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // State for forms
  const [newEvent, setNewEvent] = useState({
    name: '',
    dateType: 'single',
    dates: [''],
    startTime: '09:00',
    endTime: '17:00',
    recurrencePattern: '',
    location: '',
    capacity: '',
    registrationFee: '',
    donationGoal: '',
    eventType: '',
    customQuestions: []
  });

  const [newVolunteer, setNewVolunteer] = useState({
    name: '', email: '', phone: '', role: '', securityLevel: 'volunteer'
  });

  const [newAttendee, setNewAttendee] = useState({
    primaryName: '',
    email: '',
    phone: '',
    groupMembers: [],
    customResponses: {}
  });

  const [newGroupMember, setNewGroupMember] = useState({
    name: '', relationship: ''
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '', type: 'text', required: false, options: []
  });

  // State for message composition
  const [newMessage, setNewMessage] = useState({
    type: 'announcement',
    recipients: 'all-volunteers',
    eventId: '',
    subject: '',
    message: '',
    sendVia: 'email'
  });

  // State for payments and donations
  const [paymentsTab, setPaymentsTab] = useState('overview');
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [showCreateDonation, setShowCreateDonation] = useState(false);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('all');
  const [donationSearchTerm, setDonationSearchTerm] = useState('');
  const [donationFilterType, setDonationFilterType] = useState('all');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    paymentMethod: 'stripe',
    description: '',
    recipientEmail: ''
  });

  // Sample payments data
  const [payments, setPayments] = useState(() => loadFromLocalStorage('payments', [
    {
      id: 1,
      eventId: 1,
      eventName: 'Youth Summer Retreat',
      attendeeId: 1,
      attendeeName: 'John Smith',
      attendeeCount: 2,
      amount: 150.00,
      paymentMethod: 'Credit Card',
      status: 'completed',
      date: '2025-01-15',
      transactionId: 'txn_123456789'
    },
    {
      id: 2,
      eventId: 1,
      eventName: 'Youth Summer Retreat',
      attendeeId: 2,
      attendeeName: 'Sarah Johnson',
      attendeeCount: 1,
      amount: 75.00,
      paymentMethod: 'PayPal',
      status: 'completed',
      date: '2025-01-16',
      transactionId: 'txn_123456790'
    }
  ]));

  // Sample donations data
  const [donations, setDonations] = useState(() => loadFromLocalStorage('donations', [
    {
      id: 1,
      donorName: 'Anonymous Donor',
      amount: 500.00,
      campaign: 'Building Fund',
      paymentMethod: 'Credit Card',
      recurring: false,
      anonymous: true,
      message: 'In memory of our beloved community',
      date: '2025-01-10',
      transactionId: 'don_123456789'
    },
    {
      id: 2,
      donorName: 'Michael Brown',
      amount: 250.00,
      campaign: 'Youth Ministry',
      paymentMethod: 'Bank Transfer',
      recurring: true,
      anonymous: false,
      message: 'Supporting our youth programs',
      date: '2025-01-12',
      transactionId: 'don_123456790'
    }
  ]));

  // Message templates
  const messageTemplates = {
    'registration-confirmation': {
      subject: 'Registration Confirmed - {eventName}',
      message: 'Hi {name},\n\nYour registration for {eventName} has been confirmed!\n\nEvent Details:\nDate: {eventDate}\nLocation: {eventLocation}\n\nWe look forward to seeing you there!\n\nBest regards,\nChurch Team'
    },
    'volunteer-reminder': {
      subject: 'Volunteer Reminder - {eventName}',
      message: 'Hi {name},\n\nThis is a reminder that you\'re volunteering for {eventName} tomorrow.\n\nPlease arrive 30 minutes early at {eventLocation}.\n\nThank you for your service!\n\nBlessings,\nChurch Team'
    }
  };

  const [editingEvent, setEditingEvent] = useState(null);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage('events', events);
  }, [events]);

  useEffect(() => {
    saveToLocalStorage('volunteers', volunteers);
  }, [volunteers]);

  useEffect(() => {
    saveToLocalStorage('attendees', attendees);
  }, [attendees]);

  useEffect(() => {
    saveToLocalStorage('communications', communications);
  }, [communications]);

  useEffect(() => {
    saveToLocalStorage('payments', payments);
  }, [payments]);

  useEffect(() => {
    saveToLocalStorage('donations', donations);
  }, [donations]);

  // Handle form input changes
  const handleEventInputChange = useCallback((field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleVolunteerInputChange = useCallback((field, value) => {
    setNewVolunteer(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAttendeeInputChange = useCallback((field, value) => {
    setNewAttendee(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleMessageInputChange = useCallback((field, value) => {
    setNewMessage(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle adding a group member to registration
  const addGroupMember = useCallback(() => {
    if (newGroupMember.name && newGroupMember.relationship) {
      setNewAttendee(prev => ({
        ...prev,
        groupMembers: [...prev.groupMembers, { ...newGroupMember, checkedIn: false }]
      }));
      setNewGroupMember({ name: '', relationship: '' });
    }
  }, [newGroupMember]);

  // Handle removing a group member
  const removeGroupMember = useCallback((index) => {
    setNewAttendee(prev => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle adding custom question to event
  const addCustomQuestion = useCallback(() => {
    if (newQuestion.question) {
      setNewEvent(prev => ({
        ...prev,
        customQuestions: [...prev.customQuestions, { ...newQuestion, id: Date.now() }]
      }));
      setNewQuestion({ question: '', type: 'text', required: false, options: [] });
    }
  }, [newQuestion]);

  // Handle removing custom question
  const removeCustomQuestion = useCallback((id) => {
    setNewEvent(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter(q => q.id !== id)
    }));
  }, []);

  // Apply event template
  const applyEventTemplate = useCallback((templateKey) => {
    const template = eventTemplates[templateKey];
    if (template) {
      setNewEvent(prev => ({
        ...prev,
        name: template.name,
        eventType: template.eventType,
        customQuestions: template.customQuestions || []
      }));
      setSelectedTemplate(templateKey);
    }
  }, []);

  // Payment utility functions
  const getTotalRevenue = useCallback(() => {
    const eventPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const donationTotal = donations.reduce((sum, d) => sum + d.amount, 0);
    return eventPayments + donationTotal;
  }, [payments, donations]);

  const getEventPaymentsTotal = useCallback(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const getDonationsTotal = useCallback(() => {
    return donations.reduce((sum, d) => sum + d.amount, 0);
  }, [donations]);

  const getActiveDonorsCount = useCallback(() => {
    const uniqueDonors = new Set(donations.map(d => d.donorName));
    return uniqueDonors.size;
  }, [donations]);

  const getRecentPaymentsActivity = useCallback(() => {
    const allActivity = [
      ...payments.map(p => ({
        id: p.id,
        type: 'payment',
        description: `Payment for ${p.eventName}`,
        eventName: p.eventName,
        amount: p.amount,
        status: p.status,
        date: p.date
      })),
      ...donations.map(d => ({
        id: d.id,
        type: 'donation',
        description: `Donation to ${d.campaign || 'General Fund'}`,
        donorName: d.donorName,
        amount: d.amount,
        status: 'completed',
        date: d.date
      }))
    ];
    return allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, donations]);

  const filterPayments = useCallback((payments, searchTerm, filterStatus) => {
    return payments.filter(payment => {
      const matchesSearch = payment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.attendeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, []);

  const filterDonations = useCallback((donations, searchTerm, filterType) => {
    return donations.filter(donation => {
      const matchesSearch = donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (donation.campaign && donation.campaign.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || donation.campaign === filterType;
      return matchesSearch && matchesFilter;
    });
  }, []);

  const getPaymentStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#dc2626';
      case 'refunded': return '#6b7280';
      default: return '#6b7280';
    }
  }, []);

  const getMonthlyRevenueData = useCallback(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      amount: Math.random() * 5000 + 1000 // Mock data for now
    }));
  }, []);

  const getTopDonors = useCallback(() => {
    const donorTotals = {};
    donations.forEach(donation => {
      if (!donorTotals[donation.donorName]) {
        donorTotals[donation.donorName] = 0;
      }
      donorTotals[donation.donorName] += donation.amount;
    });
    return Object.entries(donorTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [donations]);

  const handleViewPaymentDetails = useCallback((payment) => {
    alert(`Payment Details:\nEvent: ${payment.eventName}\nAttendee: ${payment.attendeeName}\nAmount: $${payment.amount}\nStatus: ${payment.status}`);
  }, []);

  const handleRefundPayment = useCallback((paymentId) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'refunded' } : p
      ));
      alert('Payment refunded successfully!');
    }
  }, []);

  const handleViewDonationDetails = useCallback((donation) => {
    alert(`Donation Details:\nDonor: ${donation.donorName}\nAmount: $${donation.amount}\nCampaign: ${donation.campaign || 'General'}\nMessage: ${donation.message || 'None'}`);
  }, []);

  const handleSendThankYou = useCallback((donation) => {
    alert(`Thank you email sent to ${donation.donorName} for their generous donation of $${donation.amount}!`);
  }, []);

  const exportPaymentsReport = useCallback(() => {
    const csv = 'Event,Attendee,Amount,Status,Date\n' +
                payments.map(p => `${p.eventName},${p.attendeeName},${p.amount},${p.status},${p.date}`).join('\n');
    downloadCSV(csv, 'payments-report.csv');
  }, [payments]);

  const exportDonationsReport = useCallback(() => {
    const csv = 'Donor,Campaign,Amount,Date\n' +
                donations.map(d => `${d.donorName},${d.campaign || 'General'},${d.amount},${d.date}`).join('\n');
    downloadCSV(csv, 'donations-report.csv');
  }, [donations]);

  const exportFinancialSummary = useCallback(() => {
    alert('Financial summary PDF export would be generated here with charts and detailed breakdowns.');
  }, []);

  const downloadCSV = useCallback((csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  // Payment processing functions
  const processPayment = useCallback(async (paymentData) => {
    try {
      // This would integrate with your chosen payment gateway
      console.log('Processing payment:', paymentData);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, create a mock payment record
      const newPayment = {
        id: Date.now(),
        eventId: null,
        eventName: 'Direct Payment',
        attendeeId: null,
        attendeeName: 'Direct Transfer',
        attendeeCount: 1,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        transactionId: `txn_${Date.now()}`,
        description: paymentData.description,
        recipientEmail: paymentData.recipientEmail
      };
      
      setPayments(prev => [newPayment, ...prev]);
      setShowPaymentForm(false);
      setPaymentFormData({ amount: '', paymentMethod: 'stripe', description: '', recipientEmail: '' });
      
      alert(`Payment processed successfully! Transaction ID: ${newPayment.transactionId}`);
      
      // In real implementation, this would:
      // 1. Send payment to Stripe/PayPal/Square
      // 2. Transfer funds to recipient account
      // 3. Update payment status based on gateway response
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      alert('Payment failed. Please try again.');
    }
  }, []);

  const handlePaymentFormSubmit = useCallback((e) => {
    e.preventDefault();
    if (!paymentFormData.amount || !paymentFormData.description) {
      alert('Please fill in all required fields');
      return;
    }
    processPayment(paymentFormData);
  }, [paymentFormData, processPayment]);

  // Handle creating a new event
  const handleCreateEvent = useCallback(() => {
    // Validate form
    const errors = validateEventForm(newEvent);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert('Please fix the following errors:\n' + Object.values(errors).join('\n'));
      return;
    }
    
    setFormErrors({}); // Clear errors
    
    if (newEvent.name) {
      const event = {
        id: Date.now(),
        name: newEvent.name,
        dateType: newEvent.dateType,
        dates: newEvent.dates.filter(d => d),
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        recurrencePattern: newEvent.recurrencePattern,
        location: newEvent.location,
        capacity: parseInt(newEvent.capacity) || 50,
        registrationFee: parseFloat(newEvent.registrationFee) || 0,
        donationGoal: parseFloat(newEvent.donationGoal) || 0,
        donations: 0,
        volunteers: [],
        status: 'active',
        eventType: newEvent.eventType,
        customQuestions: newEvent.customQuestions
      };
      
      setEvents(prev => [...prev, event]);
      setNewEvent({
        name: '', dateType: 'single', dates: [''], startTime: '09:00', endTime: '17:00',
        recurrencePattern: '', location: '', capacity: '', registrationFee: '', donationGoal: '',
        eventType: '', customQuestions: []
      });
      setSelectedTemplate('');
      setShowCreateEvent(false);
      setActiveTab('events');
      addNotification('Event created successfully!', 'success');
    } else {
      alert('Please fill in at least the Event Name');
    }
  }, [newEvent, addNotification]);

  // Handle editing an event
  const handleEditEvent = useCallback((event) => {
    setEditingEvent({
      ...event,
      dates: event.dates.length > 0 ? event.dates : ['']
    });
    setShowEditEvent(true);
  }, []);

  // Handle updating an event
  const handleUpdateEvent = useCallback(() => {
    if (!editingEvent) return;
    
    // Validate form
    const errors = validateEventForm(editingEvent);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert('Please fix the following errors:\n' + Object.values(errors).join('\n'));
      return;
    }
    
    setFormErrors({}); // Clear errors
    
    setEvents(prev => prev.map(event => 
      event.id === editingEvent.id ? {
        ...editingEvent,
        dates: editingEvent.dates.filter(d => d),
        capacity: parseInt(editingEvent.capacity) || 50,
        registrationFee: parseFloat(editingEvent.registrationFee) || 0,
        donationGoal: parseFloat(editingEvent.donationGoal) || 0
      } : event
    ));
    
    setShowEditEvent(false);
    setEditingEvent(null);
    alert('Event updated successfully!');
  }, [editingEvent]);

  // Handle closing/archiving an event
  const handleEventStatusChange = useCallback((eventId, newStatus) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    ));
  }, []);

  // Handle deleting an archived event
  const handleDeleteEvent = useCallback((eventId) => {
    if (window.confirm('Are you sure you want to permanently delete this archived event? This action cannot be undone.')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setAttendees(prev => prev.filter(a => a.eventId !== eventId));
    }
  }, []);

  // Handle adding a new volunteer
  const handleAddVolunteer = useCallback(() => {
    // Validate form
    const errors = validateVolunteerForm(newVolunteer);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert('Please fix the following errors:\n' + Object.values(errors).join('\n'));
      return;
    }
    
    setFormErrors({}); // Clear errors
    
    if (newVolunteer.name && newVolunteer.email) {
      const volunteer = {
        id: Date.now(),
        name: newVolunteer.name,
        email: newVolunteer.email,
        phone: newVolunteer.phone,
        role: newVolunteer.role || 'Volunteer',
        securityLevel: newVolunteer.securityLevel
      };
      
      setVolunteers(prev => [...prev, volunteer]);
      setNewVolunteer({ name: '', email: '', phone: '', role: '', securityLevel: 'volunteer' });
      setShowAddVolunteer(false);
              addNotification('Volunteer added successfully!', 'success');
    } else {
      alert('Please fill in the required fields: Name and Email');
    }
  }, [newVolunteer]);

  // Handle event registration with group members
  const handleEventRegistration = useCallback(async () => {
    // Validate form
    const errors = validateAttendeeForm(newAttendee);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert('Please fix the following errors:\n' + Object.values(errors).join('\n'));
      return;
    }
    
    setFormErrors({}); // Clear errors
    
    if (newAttendee.primaryName && newAttendee.email && selectedEvent) {
      const eventAttendees = attendees.filter(a => a.eventId === selectedEvent.id);
      const totalPeopleInGroup = 1 + newAttendee.groupMembers.length;
      const totalRegistered = eventAttendees.reduce((sum, a) => sum + 1 + a.groupMembers.length, 0);
      
      if (totalRegistered + totalPeopleInGroup > selectedEvent.capacity) {
        alert(`Sorry, this event only has ${selectedEvent.capacity - totalRegistered} spots left!`);
        return;
      }

      const attendee = {
        id: Date.now(),
        eventId: selectedEvent.id,
        primaryName: newAttendee.primaryName,
        email: newAttendee.email,
        phone: newAttendee.phone,
        registrationDate: new Date().toISOString().split('T')[0],
        checkedIn: false,
        paymentStatus: selectedEvent.registrationFee > 0 ? 'pending' : 'free',
        groupMembers: newAttendee.groupMembers,
        customResponses: newAttendee.customResponses
      };
      
      setAttendees(prev => [...prev, attendee]);
      setNewAttendee({ primaryName: '', email: '', phone: '', groupMembers: [], customResponses: {} });
      setShowRegistration(false);
      
      const totalFee = selectedEvent.registrationFee * totalPeopleInGroup;
      alert(`Successfully registered ${totalPeopleInGroup} person(s) for ${selectedEvent.name}!${selectedEvent.registrationFee > 0 ? ` Total payment of $${totalFee} required.` : ''}`);

      // Send automated confirmation email if enabled
      if (notificationSettings.registrationConfirmation) {
        try {
          const template = enhancedMessageTemplates['registration-confirmation'];
          let subject = template.subject.replace(/{eventName}/g, selectedEvent.name);
          let message = template.message
            .replace(/{name}/g, newAttendee.primaryName)
            .replace(/{eventName}/g, selectedEvent.name)
            .replace(/{eventDate}/g, formatEventDates(selectedEvent))
            .replace(/{eventLocation}/g, selectedEvent.location || 'TBD')
            .replace(/{eventFee}/g, selectedEvent.registrationFee > 0 ? `$${selectedEvent.registrationFee}` : 'Free');

          await mockEmailService.sendEmail(newAttendee.email, subject, message);
          console.log('📧 Registration confirmation email sent to:', newAttendee.email);
        } catch (error) {
          console.error('Failed to send registration confirmation email:', error);
        }
      }
    } else {
      alert('Please fill in the required fields: Name and Email');
    }
  }, [newAttendee, selectedEvent, attendees, notificationSettings.registrationConfirmation]);

  // Handle editing an attendee
  const handleEditAttendee = useCallback((attendee) => {
    setSelectedAttendee(attendee);
    setShowEditAttendee(true);
  }, []);

  // Handle updating an attendee
  const handleUpdateAttendee = useCallback(() => {
    if (selectedAttendee) {
      setAttendees(prev => prev.map(a => 
        a.id === selectedAttendee.id ? selectedAttendee : a
      ));
      setShowEditAttendee(false);
      setSelectedAttendee(null);
      alert('Attendee updated successfully!');
    }
  }, [selectedAttendee]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.subject || !newMessage.message) {
      alert('Please fill in the subject and message fields');
      return;
    }

    let recipientList = [];
    let recipientDescription = '';

    switch (newMessage.recipients) {
      case 'all-volunteers':
        recipientList = volunteers;
        recipientDescription = 'All Volunteers';
        break;
      case 'all-attendees':
        recipientList = attendees;
        recipientDescription = 'All Attendees';
        break;
      case 'event-volunteers':
        if (newMessage.eventId) {
          const event = events.find(e => e.id === parseInt(newMessage.eventId));
          recipientList = volunteers.filter(v => event?.volunteers.includes(v.id));
          recipientDescription = `${event?.name} Volunteers`;
        }
        break;
      case 'event-attendees':
        if (newMessage.eventId) {
          const event = events.find(e => e.id === parseInt(newMessage.eventId));
          recipientList = attendees.filter(a => a.eventId === parseInt(newMessage.eventId));
          recipientDescription = `${event?.name} Attendees`;
        }
        break;
      default:
        break;
    }

    if (recipientList.length === 0) {
      alert('No recipients found for the selected criteria');
      return;
    }

    // Show sending status
    const sendButton = document.querySelector('[data-send-button]');
    if (sendButton) {
      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';
    }

    try {
      // Send emails to each recipient
      const emailPromises = recipientList.map(async (recipient) => {
        const email = recipient.email || recipient.primaryName?.toLowerCase().replace(/\s+/g, '.') + '@example.com';
        const name = recipient.name || recipient.primaryName || 'Valued Member';
        
        // Replace template variables
        let subject = newMessage.subject;
        let message = newMessage.message;
        
        // Replace common variables
        subject = subject.replace(/{name}/g, name);
        message = message.replace(/{name}/g, name);
        
        // Replace event-specific variables if applicable
        if (newMessage.eventId) {
          const event = events.find(e => e.id === parseInt(newMessage.eventId));
          if (event) {
            subject = subject.replace(/{eventName}/g, event.name);
            message = message.replace(/{eventName}/g, event.name);
            message = message.replace(/{eventDate}/g, formatEventDates(event));
            message = message.replace(/{eventLocation}/g, event.location || 'TBD');
            message = message.replace(/{eventFee}/g, event.registrationFee > 0 ? `$${event.registrationFee}` : 'Free');
          }
        }

        return await mockEmailService.sendEmail(email, subject, message);
      });

      await Promise.all(emailPromises);

      const communication = {
        id: Date.now(),
        type: newMessage.type,
        subject: newMessage.subject,
        message: newMessage.message,
        recipients: recipientDescription,
        sentDate: new Date().toISOString().split('T')[0],
        sentBy: 'Admin',
        recipientCount: recipientList.length,
        sendVia: newMessage.sendVia,
        status: 'sent'
      };

      setCommunications(prev => [communication, ...prev]);
      setNewMessage({
        type: 'announcement',
        recipients: 'all-volunteers',
        eventId: '',
        subject: '',
        message: '',
        sendVia: 'email'
      });
      setShowSendMessage(false);
      
      alert(`✅ Email sent successfully to ${recipientList.length} recipient(s)! Check the console for details.`);
    } catch (error) {
      console.error('Failed to send emails:', error);
      alert('❌ Failed to send some emails. Please try again.');
    } finally {
      // Reset button
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'Send Message';
      }
    }
  }, [newMessage, volunteers, attendees, events]);

  // Apply message template
  const applyMessageTemplate = (templateKey) => {
    const template = messageTemplates[templateKey];
    if (template) {
      setNewMessage(prev => ({
        ...prev,
        subject: template.subject,
        message: template.message
      }));
    }
  };

  // Handle managing an event (open modal)
  const handleManageEvent = (event) => {
    setSelectedEvent(event);
    setManageEventTab('volunteers');
    setShowManageEvent(true);
  };

  // Handle event registration (open registration form)
  const handleRegisterForEvent = (event) => {
    setSelectedEvent(event);
    setShowRegistration(true);
  };

  // Handle volunteer assignment/unassignment
  const toggleVolunteerAssignment = (volunteerId) => {
    if (!selectedEvent) return;
    
    setEvents(prev => prev.map(event => {
      if (event.id === selectedEvent.id) {
        const isAssigned = event.volunteers.includes(volunteerId);
        const newVolunteers = isAssigned 
          ? event.volunteers.filter(id => id !== volunteerId)
          : [...event.volunteers, volunteerId];
        
        return { ...event, volunteers: newVolunteers };
      }
      return event;
    }));

    setSelectedEvent(prev => {
      if (!prev) return null;
      const isAssigned = prev.volunteers.includes(volunteerId);
      const newVolunteers = isAssigned 
        ? prev.volunteers.filter(id => id !== volunteerId)
        : [...prev.volunteers, volunteerId];
      
      return { ...prev, volunteers: newVolunteers };
    });
  };

  // Handle attendee check-in (including group members)
  const toggleAttendeeCheckIn = (attendeeId, memberIndex = null) => {
    setAttendees(prev => prev.map(a => {
      if (a.id === attendeeId) {
        if (memberIndex !== null) {
          // Check in a group member
          const updatedGroupMembers = [...a.groupMembers];
          updatedGroupMembers[memberIndex] = {
            ...updatedGroupMembers[memberIndex],
            checkedIn: !updatedGroupMembers[memberIndex].checkedIn
          };
          return { ...a, groupMembers: updatedGroupMembers };
        } else {
          // Check in primary attendee
          return { ...a, checkedIn: !a.checkedIn };
        }
      }
      return a;
    }));
  };

  // Handle notification settings change
  const toggleNotificationSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Helper function to get event attendees
  const getEventAttendees = (eventId) => {
    return attendees.filter(a => a.eventId === eventId);
  };

  // Helper function to get total people count for an event
  const getTotalPeopleCount = (eventId) => {
    const eventAttendees = getEventAttendees(eventId);
    return eventAttendees.reduce((sum, a) => sum + 1 + a.groupMembers.length, 0);
  };

  // Helper function to format event dates
  const formatEventDates = (event) => {
    let dateString = '';
    
    if (event.dateType === 'recurring') {
      dateString = event.recurrencePattern;
    } else if (event.dateType === 'ongoing') {
      dateString = 'Ongoing';
    } else if (event.dates.length === 1) {
      dateString = new Date(event.dates[0]).toLocaleDateString();
    } else if (event.dates.length > 1) {
      dateString = `Multiple dates (${event.dates.length})`;
    } else {
      dateString = 'No date set';
    }
    
    // Add time information if available
    if (event.startTime && event.endTime) {
      dateString += ` • ${event.startTime} - ${event.endTime}`;
    }
    
    return dateString;
  };

  // Function to send volunteer reminders
  const sendVolunteerReminders = useCallback(async (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const eventVolunteers = volunteers.filter(v => event.volunteers.includes(v.id));
    
    if (eventVolunteers.length === 0) {
      alert('No volunteers assigned to this event');
      return;
    }

    const template = enhancedMessageTemplates['volunteer-reminder'];
    const emailPromises = eventVolunteers.map(async (volunteer) => {
      const subject = template.subject.replace(/{eventName}/g, event.name);
      const message = template.message
        .replace(/{name}/g, volunteer.name)
        .replace(/{eventName}/g, event.name)
        .replace(/{eventDate}/g, formatEventDates(event))
        .replace(/{eventLocation}/g, event.location || 'TBD');

      return await mockEmailService.sendEmail(volunteer.email, subject, message);
    });

    try {
      await Promise.all(emailPromises);
      alert(`✅ Volunteer reminders sent to ${eventVolunteers.length} volunteer(s)!`);
      
      // Add to communications history
      const communication = {
        id: Date.now(),
        type: 'reminder',
        subject: `Volunteer Reminder - ${event.name}`,
        message: `Automated reminder sent to ${eventVolunteers.length} volunteers for ${event.name}`,
        recipients: `${event.name} Volunteers`,
        sentDate: new Date().toISOString().split('T')[0],
        sentBy: 'System',
        recipientCount: eventVolunteers.length,
        sendVia: 'email',
        status: 'sent'
      };
      
      setCommunications(prev => [communication, ...prev]);
    } catch (error) {
      console.error('Failed to send volunteer reminders:', error);
      alert('❌ Failed to send some volunteer reminders. Please try again.');
    }
  }, [events, volunteers]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
      {/* Notification System */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              backgroundColor: notification.type === 'success' ? '#dcfce7' : 
                             notification.type === 'error' ? '#fef2f2' : 
                             notification.type === 'warning' ? '#fef3c7' : '#dbeafe',
              color: notification.type === 'success' ? '#166534' : 
                     notification.type === 'error' ? '#dc2626' : 
                     notification.type === 'warning' ? '#d97706' : '#1d4ed8',
              border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : 
                                   notification.type === 'error' ? '#fecaca' : 
                                   notification.type === 'warning' ? '#fed7aa' : '#bfdbfe'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              minWidth: '300px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {notification.message}
            </span>
            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '12px'
              }}
            >
              <X style={{ height: '16px', width: '16px' }} />
            </button>
          </div>
        ))}
      </div>
      
      {/* PWA Offline Indicator */}
      <OfflineIndicator />
      
      {/* Sidebar */}
      <div style={{ width: '256px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb' }}>
        <div style={{ padding: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>ChurchConnect</h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Event Manager</p>
        </div>
        
        <nav style={{ marginTop: '24px' }}>
          {[
            { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
            { id: 'events', name: 'Events', icon: CalendarIcon },
            { id: 'volunteers', name: 'Volunteers', icon: Users },
            { id: 'attendees', name: 'Attendees', icon: User },
            { id: 'payments', name: 'Payments', icon: CreditCard },
            { id: 'communications', name: 'Communications', icon: Mail },
            { id: 'settings', name: 'Settings', icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSearchTerm('');
                setFilterStatus('all');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                textAlign: 'left',
                backgroundColor: activeTab === item.id ? '#dbeafe' : 'transparent',
                color: activeTab === item.id ? '#1d4ed8' : '#374151',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <item.icon style={{ height: '20px', width: '20px', marginRight: '12px' }} />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Event Calendar</h2>
            
            {/* Event Calendar - Main Focus */}
            <Calendar 
              events={events} 
              volunteers={volunteers} 
              attendees={attendees} 
              onEventClick={(event) => {
                handleManageEvent(event);
                setActiveTab('events');
              }}
            />
          </div>
        )}

        {activeTab === 'events' && (
          <EventsView
            showArchivedEvents={showArchivedEvents}
            setShowArchivedEvents={setShowArchivedEvents}
            setShowCreateEvent={setShowCreateEvent}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            events={events}
            setEvents={setEvents}
            filterEvents={filterEvents}
            getTotalPeopleCount={getTotalPeopleCount}
            formatEventDates={formatEventDates}
            handleManageEvent={handleManageEvent}
            handleEditEvent={handleEditEvent}
            handleRegisterForEvent={handleRegisterForEvent}
            handleEventStatusChange={handleEventStatusChange}
            handleDeleteEvent={handleDeleteEvent}
            volunteers={volunteers}
            communications={communications}
            sendVolunteerReminders={sendVolunteerReminders}
          />
        )}

        {activeTab === 'volunteers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
                  fontWeight: 'bold'
                }}
              >
                <Plus style={{ height: '16px', width: '16px' }} />
                Add Volunteer
              </button>
            </div>

            {/* Search Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative', maxWidth: '400px' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#6b7280' }} />
                <input
                  type="text"
                  placeholder="Search volunteers by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {filterVolunteers(volunteers, searchTerm).map((volunteer, index) => {
                const volunteerEvents = events.filter(event => event.volunteers.includes(volunteer.id));
                return (
                  <div key={volunteer.id} style={{ 
                    padding: '20px', 
                    borderBottom: index < volunteers.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{volunteer.name}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px 0' }}>{volunteer.email}</p>
                        {volunteer.phone && (
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>{volunteer.phone}</p>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ 
                            backgroundColor: '#dbeafe', 
                            color: '#1d4ed8', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {volunteer.role}
                          </span>
                          <span style={{ 
                            backgroundColor: volunteer.securityLevel === 'admin' ? '#fef3c7' : '#f3f4f6', 
                            color: volunteer.securityLevel === 'admin' ? '#d97706' : '#6b7280', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {volunteer.securityLevel === 'admin' && <Shield style={{ height: '10px', width: '10px' }} />}
                            {volunteer.securityLevel}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: '#3b82f6' }}>
                            {volunteerEvents.length}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>Events</p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                              const newName = prompt('Edit volunteer name:', volunteer.name);
                              if (newName) {
                                setVolunteers(prev => prev.map(v => 
                                  v.id === volunteer.id ? { ...v, name: newName } : v
                                ));
                              }
                            }}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Edit Volunteer"
                          >
                            <Edit2 style={{ height: '14px', width: '14px' }} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove volunteer ${volunteer.name}?`)) {
                                setVolunteers(prev => prev.filter(v => v.id !== volunteer.id));
                                // Also remove from events
                                setEvents(prev => prev.map(event => ({
                                  ...event,
                                  volunteers: event.volunteers.filter(vId => vId !== volunteer.id)
                                })));
                              }
                            }}
                            style={{
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                              fontSize: '12px'
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
                        <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Assigned Events:</p>
                        {volunteerEvents.map(event => (
                          <div key={event.id} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                            {event.name} - {formatEventDates(event)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>All Attendees</h2>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {attendees.reduce((sum, a) => sum + 1 + a.groupMembers.length, 0)} total people • {
                  attendees.filter(a => a.checkedIn).length + 
                  attendees.reduce((sum, a) => sum + a.groupMembers.filter(m => m.checkedIn).length, 0)
                } checked in
              </div>
            </div>

            {events.filter(e => e.status !== 'archived').map(event => {
              const eventAttendees = getEventAttendees(event.id);
              if (eventAttendees.length === 0) return null;
              
              return (
                <div key={event.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{event.name}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                      {formatEventDates(event)} • {getTotalPeopleCount(event.id)}/{event.capacity} registered
                    </p>
                  </div>
                  {eventAttendees.map((attendee, index) => (
                    <div key={attendee.id} style={{ 
                      padding: '16px 20px', 
                      borderBottom: index < eventAttendees.length - 1 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: attendee.checkedIn ? '#f0f9ff' : 'white'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>{attendee.primaryName}</h4>
                            {attendee.checkedIn && (
                              <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />
                            )}
                          </div>
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px 0' }}>{attendee.email}</p>
                          {attendee.phone && (
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>{attendee.phone}</p>
                          )}
                          
                          {/* Group Members */}
                          {attendee.groupMembers.length > 0 && (
                            <div style={{ marginTop: '8px', paddingLeft: '16px', borderLeft: '2px solid #e5e7eb' }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '4px' }}>
                                Group Members ({attendee.groupMembers.length}):
                              </p>
                              {attendee.groupMembers.map((member, memberIndex) => (
                                <div key={memberIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '14px' }}>{member.name}</span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>({member.relationship})</span>
                                    {member.checkedIn && (
                                      <CheckCircle style={{ height: '14px', width: '14px', color: '#10b981' }} />
                                    )}
                                  </div>
                                  <button
                                    onClick={() => toggleAttendeeCheckIn(attendee.id, memberIndex)}
                                    style={{
                                      backgroundColor: member.checkedIn ? '#dc2626' : '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '2px 8px',
                                      cursor: 'pointer',
                                      fontSize: '11px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {member.checkedIn ? 'Check Out' : 'Check In'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Custom Responses */}
                          {Object.keys(attendee.customResponses).length > 0 && (
                            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '4px' }}>Responses:</p>
                              {Object.entries(attendee.customResponses).map(([key, value]) => {
                                const question = event.customQuestions?.find(q => q.id === key);
                                return (
                                  <p key={key} style={{ fontSize: '12px', margin: '2px 0' }}>
                                    <span style={{ color: '#6b7280' }}>{question?.question || key}:</span> {value}
                                  </p>
                                );
                              })}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              Registered: {new Date(attendee.registrationDate).toLocaleDateString()}
                            </span>
                            <span style={{
                              backgroundColor: attendee.paymentStatus === 'paid' ? '#dcfce7' : 
                                             attendee.paymentStatus === 'pending' ? '#fef3c7' : '#f3f4f6',
                              color: attendee.paymentStatus === 'paid' ? '#16a34a' : 
                                     attendee.paymentStatus === 'pending' ? '#d97706' : '#6b7280',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {attendee.paymentStatus === 'free' ? 'Free Event' : attendee.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditAttendee(attendee)}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                            title="Edit Attendee"
                          >
                            <Edit2 style={{ height: '14px', width: '14px' }} />
                          </button>
                          <button
                            onClick={() => toggleAttendeeCheckIn(attendee.id)}
                            style={{
                              backgroundColor: attendee.checkedIn ? '#dc2626' : '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {attendee.checkedIn ? 'Check Out' : 'Check In'}
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove ${attendee.primaryName} from this event?`)) {
                                setAttendees(prev => prev.filter(a => a.id !== attendee.id));
                              }
                            }}
                            style={{
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                            title="Remove Attendee"
                          >
                            <Trash2 style={{ height: '14px', width: '14px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {attendees.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: '48px' }}>
                <User style={{ height: '48px', width: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Attendees Yet</h3>
                <p style={{ color: '#6b7280' }}>Attendees will appear here once people register for events</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'communications' && (
          <CommunicationsView
            communicationsTab={communicationsTab}
            setCommunicationsTab={setCommunicationsTab}
            communications={communications}
            notificationSettings={notificationSettings}
            toggleNotificationSetting={toggleNotificationSetting}
            setShowSendMessage={setShowSendMessage}
            setShowCreateTemplate={setShowCreateTemplate}
            setNewMessage={setNewMessage}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            paymentsTab={paymentsTab}
            setPaymentsTab={setPaymentsTab}
            payments={payments}
            donations={donations}
            getTotalRevenue={getTotalRevenue}
            getEventPaymentsTotal={getEventPaymentsTotal}
            getDonationsTotal={getDonationsTotal}
            getActiveDonorsCount={getActiveDonorsCount}
            getRecentPaymentsActivity={getRecentPaymentsActivity}
            getMonthlyRevenueData={getMonthlyRevenueData}
            getTopDonors={getTopDonors}
            filterPayments={filterPayments}
            filterDonations={filterDonations}
            paymentSearchTerm={paymentSearchTerm}
            setPaymentSearchTerm={setPaymentSearchTerm}
            paymentFilterStatus={paymentFilterStatus}
            setPaymentFilterStatus={setPaymentFilterStatus}
            donationSearchTerm={donationSearchTerm}
            setDonationSearchTerm={setDonationSearchTerm}
            donationFilterType={donationFilterType}
            setDonationFilterType={setDonationFilterType}
            getPaymentStatusColor={getPaymentStatusColor}
            handleViewPaymentDetails={handleViewPaymentDetails}
            handleRefundPayment={handleRefundPayment}
            handleViewDonationDetails={handleViewDonationDetails}
            handleSendThankYou={handleSendThankYou}
            exportPaymentsReport={exportPaymentsReport}
            exportDonationsReport={exportDonationsReport}
            exportFinancialSummary={exportFinancialSummary}
            setShowPaymentForm={setShowPaymentForm}
            setShowCreateDonation={setShowCreateDonation}
            setShowCreatePayment={setShowCreatePayment}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            events={events}
            eventTemplates={eventTemplates}
            addNotification={addNotification}
            setShowCreateEventTemplate={setShowCreateEventTemplate}
          />
        )}
      </div>

      {/* Event Template Creation Modal */}
      {showCreateEventTemplate && (
        <EventTemplateCreationModal
          newEventTemplate={newEventTemplate}
          setNewEventTemplate={setNewEventTemplate}
          onClose={() => setShowCreateEventTemplate(false)}
          onCreate={() => {
            const templateKey = newEventTemplate.name.toLowerCase().replace(/\s+/g, '-');
            setEventTemplates(prev => ({
              ...prev,
              [templateKey]: {
                name: newEventTemplate.name,
                eventType: newEventTemplate.eventType,
                customQuestions: newEventTemplate.customQuestions
              }
            }));
            setNewEventTemplate({ name: '', eventType: '', customQuestions: [] });
            setShowCreateEventTemplate(false);
            addNotification('Event template created successfully!', 'success');
          }}
          addNotification={addNotification}
        />
      )}

      {/* All Modals */}
      {/* Enhanced Create Event Modal with Templates and Custom Questions */}
      {showCreateEvent && (
        <CreateEventModal
          newEvent={newEvent}
          handleEventInputChange={handleEventInputChange}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          eventTemplates={eventTemplates}
          applyEventTemplate={applyEventTemplate}
          formErrors={formErrors}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          addCustomQuestion={addCustomQuestion}
          removeCustomQuestion={removeCustomQuestion}
          onClose={() => {
            setShowCreateEvent(false);
            setNewEvent({
              name: '', dateType: 'single', dates: [''], startTime: '09:00', endTime: '17:00',
              recurrencePattern: '', location: '', capacity: '', registrationFee: '', donationGoal: '',
              eventType: '', customQuestions: []
            });
            setSelectedTemplate('');
            setFormErrors({});
          }}
          onCreate={handleCreateEvent}
        />
      )}

      {/* Edit Event Modal */}
      {showEditEvent && editingEvent && (
        <EditEventModal
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
          formErrors={formErrors}
          onClose={() => {
            setShowEditEvent(false);
            setEditingEvent(null);
            setFormErrors({});
          }}
          onUpdate={handleUpdateEvent}
        />
      )}

      {/* Enhanced Add Volunteer Modal with Security Level */}
      {showAddVolunteer && (
        <AddVolunteerModal
          newVolunteer={newVolunteer}
          handleVolunteerInputChange={handleVolunteerInputChange}
          formErrors={formErrors}
          onClose={() => {
            setShowAddVolunteer(false);
            setFormErrors({});
          }}
          onAdd={handleAddVolunteer}
        />
      )}

      {/* Enhanced Event Registration Modal with Group Members and Custom Questions */}
      {showRegistration && selectedEvent && (
        <EventRegistrationModal
          selectedEvent={selectedEvent}
          newAttendee={newAttendee}
          handleAttendeeInputChange={handleAttendeeInputChange}
          newGroupMember={newGroupMember}
          setNewGroupMember={setNewGroupMember}
          addGroupMember={addGroupMember}
          removeGroupMember={removeGroupMember}
          formErrors={formErrors}
          formatEventDates={formatEventDates}
          onClose={() => {
            setShowRegistration(false);
            setNewAttendee({ primaryName: '', email: '', phone: '', groupMembers: [], customResponses: {} });
            setNewGroupMember({ name: '', relationship: '' });
            setFormErrors({});
          }}
          onRegister={handleEventRegistration}
        />
      )}

      {/* Edit Attendee Modal */}
      {showEditAttendee && selectedAttendee && (
        <EditAttendeeModal
          selectedAttendee={selectedAttendee}
          setSelectedAttendee={setSelectedAttendee}
          onClose={() => {
            setShowEditAttendee(false);
            setSelectedAttendee(null);
          }}
          onUpdate={handleUpdateAttendee}
        />
      )}

      {/* Manage Event Modal */}
      {showManageEvent && selectedEvent && (
        <ManageEventModal
          selectedEvent={selectedEvent}
          manageEventTab={manageEventTab}
          setManageEventTab={setManageEventTab}
          volunteers={volunteers}
          toggleVolunteerAssignment={toggleVolunteerAssignment}
          toggleAttendeeCheckIn={toggleAttendeeCheckIn}
          getEventAttendees={getEventAttendees}
          getTotalPeopleCount={getTotalPeopleCount}
          formatEventDates={formatEventDates}
          onClose={() => setShowManageEvent(false)}
        />
      )}

      {/* Send Message Modal */}
      {showSendMessage && (
        <SendMessageModal
          newMessage={newMessage}
          handleMessageInputChange={handleMessageInputChange}
          volunteers={volunteers}
          attendees={attendees}
          events={events}
          onClose={() => setShowSendMessage(false)}
          onSend={handleSendMessage}
        />
      )}

      {/* Payment Processing Modal */}
      {showPaymentForm && (
        <PaymentProcessingModal
          paymentFormData={paymentFormData}
          setPaymentFormData={setPaymentFormData}
          onClose={() => setShowPaymentForm(false)}
          onSubmit={handlePaymentFormSubmit}
        />
      )}

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <CreateTemplateModal
          newTemplate={newTemplate}
          setNewTemplate={setNewTemplate}
          onClose={() => setShowCreateTemplate(false)}
          onCreate={() => {
            const templateKey = newTemplate.name.toLowerCase().replace(/\s+/g, '-');
            enhancedMessageTemplates[templateKey] = {
              subject: newTemplate.subject,
              message: newTemplate.message,
              type: newTemplate.type
            };
            setNewTemplate({ name: '', subject: '', message: '', type: 'announcement' });
            setShowCreateTemplate(false);
            addNotification('Template created successfully!', 'success');
          }}
          addNotification={addNotification}
        />
      )}
    </div>
  );
};

export default ChurchConnectDashboard;