import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import logger from './utils/logger';
import {
  Calendar as CalendarIcon,
  Users,
  UsersRound,
  Mail,
  Settings,
  BarChart3,
  CreditCard,
  Heart,
  X,
  User,
  CheckCircle,
  Edit2,
  Trash2,
  Home,
  Zap,
  TrendingUp,
  Building,
  PlayCircle,
} from 'lucide-react';
import Calendar from './Calendar';
import OfflineIndicator from './components/OfflineIndicator';
import UserMenu from './components/UserMenu';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storage';
import { validateEventForm, validateVolunteerForm, validateAttendeeForm } from './utils/validation';
import { filterEvents, filterVolunteers, filterAttendees } from './utils/filters';
import { mockEmailService, enhancedMessageTemplates } from './services/emailService';
import {
  SEED_EVENTS,
  SEED_VOLUNTEERS,
  SEED_ATTENDEES,
  SEED_COMMUNICATIONS,
  SEED_PAYMENTS,
  SEED_DONATIONS,
  SEED_HOUSEHOLDS,
  SEED_HOUSEHOLD_MEMBERS,
  SEED_MINISTRIES,
  SEED_ROOMS,
  SEED_RESOURCES,
  SEED_ROOM_BOOKINGS,
  SEED_PRAYER_POSTS,
  SEED_MEDIA_ITEMS,
} from './data/seedData';

const EventsView = lazy(() => import('./views/EventsView'));
const CommunicationsView = lazy(() => import('./views/CommunicationsView'));
const GivingView = lazy(() => import('./views/GivingView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const FamiliesView = lazy(() => import('./views/FamiliesView'));
const VolunteersView = lazy(() => import('./views/VolunteersView'));
const WorkflowsView = lazy(() => import('./views/WorkflowsView'));
const AnalyticsView = lazy(() => import('./views/AnalyticsView'));
const MinistriesView = lazy(() => import('./views/MinistriesView'));
const BookingsView = lazy(() => import('./views/BookingsView'));
const PrayerView = lazy(() => import('./views/PrayerView'));
const MediaView = lazy(() => import('./views/MediaView'));
const EventTemplateCreationModal = lazy(() => import('./components/modals/EventTemplateCreationModal'));
const CreateEventModal = lazy(() => import('./components/modals/CreateEventModal'));
const EditEventModal = lazy(() => import('./components/modals/EditEventModal'));
const AddVolunteerModal = lazy(() => import('./components/modals/AddVolunteerModal'));
const EventRegistrationModal = lazy(() => import('./components/modals/EventRegistrationModal'));
const EditAttendeeModal = lazy(() => import('./components/modals/EditAttendeeModal'));
const ManageEventModal = lazy(() => import('./components/modals/ManageEventModal'));
const SendMessageModal = lazy(() => import('./components/modals/SendMessageModal'));
const PaymentProcessingModal = lazy(() => import('./components/modals/PaymentProcessingModal'));
const CreateTemplateModal = lazy(() => import('./components/modals/CreateTemplateModal'));

const ChurchConnectDashboard = () => {
  const { isAuthenticated, isDemo, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Notification system
  const [notifications, setNotifications] = useState([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateEventTemplate, setShowCreateEventTemplate] = useState(false);
  const [newEventTemplate, setNewEventTemplate] = useState({
    name: '',
    eventType: '',
    customQuestions: [],
  });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    message: '',
    type: 'announcement',
  });

  // Add notification function
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    setNotifications((prev) => [...prev, notification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  // Remove notification function
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formErrors, setFormErrors] = useState({});

  // Event templates
  const [eventTemplates, setEventTemplates] = useState({
    dinner: {
      name: 'Community Dinner',
      eventType: 'dinner',
      customQuestions: [
        { id: 'dietary', question: 'Dietary restrictions?', type: 'text', required: false },
        { id: 'childcare', question: 'Childcare needed?', type: 'yes/no', required: true },
      ],
    },
    feast: {
      name: 'Feast Celebration',
      eventType: 'feast',
      customQuestions: [
        { id: 'attending', question: 'Number of family members attending?', type: 'number', required: true },
        { id: 'bringing', question: 'What dish will you bring?', type: 'text', required: false },
      ],
    },
    retreat: {
      name: 'Spiritual Retreat',
      eventType: 'retreat',
      customQuestions: [
        { id: 'roommate', question: 'Roommate preference?', type: 'text', required: false },
        { id: 'transport', question: 'Need transportation?', type: 'yes/no', required: true },
      ],
    },
    service: {
      name: 'Worship Service',
      eventType: 'service',
      customQuestions: [{ id: 'childcare', question: 'Children attending?', type: 'yes/no', required: false }],
    },
  });

  // State for events with enhanced date handling
  const [events, setEvents] = useState(() => loadFromLocalStorage('events', SEED_EVENTS));

  // State for volunteers with security levels
  const [volunteers, setVolunteers] = useState(() => loadFromLocalStorage('volunteers', SEED_VOLUNTEERS));

  // Volunteer availability for scheduling
  const [volunteerAvailability, setVolunteerAvailability] = useState(() =>
    loadFromLocalStorage('volunteer_availability', {})
  );

  // Enhanced attendee registrations with groups and custom responses
  const [attendees, setAttendees] = useState(() => loadFromLocalStorage('attendees', SEED_ATTENDEES));

  // State for communications
  const [communications, setCommunications] = useState(() =>
    loadFromLocalStorage('communications', SEED_COMMUNICATIONS)
  );

  // State for automated notifications settings
  const [notificationSettings, setNotificationSettings] = useState({
    registrationConfirmation: true,
    volunteerReminders: true,
    donationThankYou: true,
    eventUpdates: false,
    checkInConfirmation: true,
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
    customQuestions: [],
  });

  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    securityLevel: 'volunteer',
  });

  const [newAttendee, setNewAttendee] = useState({
    primaryName: '',
    email: '',
    phone: '',
    groupMembers: [],
    customResponses: {},
  });

  const [newGroupMember, setNewGroupMember] = useState({
    name: '',
    relationship: '',
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'text',
    required: false,
    options: [],
  });

  // State for message composition
  const [newMessage, setNewMessage] = useState({
    type: 'announcement',
    recipients: 'all-volunteers',
    eventId: '',
    subject: '',
    message: '',
    sendVia: 'email',
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
    recipientEmail: '',
  });

  // Sample payments data
  const [payments, setPayments] = useState(() => loadFromLocalStorage('payments', SEED_PAYMENTS));

  // Sample donations data
  const [donations, setDonations] = useState(() => loadFromLocalStorage('donations', SEED_DONATIONS));

  // State for families / households
  const [families, setFamilies] = useState(() => loadFromLocalStorage('households', SEED_HOUSEHOLDS));

  const [householdMembers, setHouseholdMembers] = useState(() =>
    loadFromLocalStorage('household_members', SEED_HOUSEHOLD_MEMBERS)
  );

  // State for ministries
  const [ministries, setMinistries] = useState(() => loadFromLocalStorage('ministries', SEED_MINISTRIES));

  // State for rooms
  const [rooms, setRooms] = useState(() => loadFromLocalStorage('rooms', SEED_ROOMS));

  // State for resources
  const [resources, setResources] = useState(() => loadFromLocalStorage('resources', SEED_RESOURCES));

  // State for room bookings
  const [roomBookings, setRoomBookings] = useState(() => loadFromLocalStorage('room_bookings', SEED_ROOM_BOOKINGS));

  // State for prayer posts
  const [prayerPosts, setPrayerPosts] = useState(() => loadFromLocalStorage('prayer_posts', SEED_PRAYER_POSTS));

  // State for media items
  const [mediaItems, setMediaItems] = useState(() => loadFromLocalStorage('media_items', SEED_MEDIA_ITEMS));

  // Message templates
  const messageTemplates = {
    'registration-confirmation': {
      subject: 'Registration Confirmed - {eventName}',
      message:
        'Hi {name},\n\nYour registration for {eventName} has been confirmed!\n\nEvent Details:\nDate: {eventDate}\nLocation: {eventLocation}\n\nWe look forward to seeing you there!\n\nBest regards,\nChurch Team',
    },
    'volunteer-reminder': {
      subject: 'Volunteer Reminder - {eventName}',
      message:
        "Hi {name},\n\nThis is a reminder that you're volunteering for {eventName} tomorrow.\n\nPlease arrive 30 minutes early at {eventLocation}.\n\nThank you for your service!\n\nBlessings,\nChurch Team",
    },
  };

  const [editingEvent, setEditingEvent] = useState(null);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!saveToLocalStorage('events', events)) {
      addNotification('Storage nearly full — event data may not be saved. Export a backup.', 'warning');
    }
  }, [events, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('volunteers', volunteers)) {
      addNotification('Storage nearly full — volunteer data may not be saved.', 'warning');
    }
  }, [volunteers, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('volunteer_availability', volunteerAvailability)) {
      addNotification('Storage nearly full — availability data may not be saved.', 'warning');
    }
  }, [volunteerAvailability, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('attendees', attendees)) {
      addNotification('Storage nearly full — attendee data may not be saved.', 'warning');
    }
  }, [attendees, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('communications', communications)) {
      addNotification('Storage nearly full — communications may not be saved.', 'warning');
    }
  }, [communications, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('payments', payments)) {
      addNotification('Storage nearly full — payment data may not be saved.', 'warning');
    }
  }, [payments, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('donations', donations)) {
      addNotification('Storage nearly full — donation data may not be saved.', 'warning');
    }
  }, [donations, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('households', families)) {
      addNotification('Storage nearly full — family data may not be saved.', 'warning');
    }
  }, [families, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('household_members', householdMembers)) {
      addNotification('Storage nearly full — household member data may not be saved.', 'warning');
    }
  }, [householdMembers, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('ministries', ministries)) {
      addNotification('Storage nearly full — ministry data may not be saved.', 'warning');
    }
  }, [ministries, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('rooms', rooms)) {
      addNotification('Storage nearly full — room data may not be saved.', 'warning');
    }
  }, [rooms, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('resources', resources)) {
      addNotification('Storage nearly full — resource data may not be saved.', 'warning');
    }
  }, [resources, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('room_bookings', roomBookings)) {
      addNotification('Storage nearly full — booking data may not be saved.', 'warning');
    }
  }, [roomBookings, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('prayer_posts', prayerPosts)) {
      addNotification('Storage nearly full — prayer data may not be saved.', 'warning');
    }
  }, [prayerPosts, addNotification]);

  useEffect(() => {
    if (!saveToLocalStorage('media_items', mediaItems)) {
      addNotification('Storage nearly full — media data may not be saved.', 'warning');
    }
  }, [mediaItems, addNotification]);

  // Handle form input changes
  const handleEventInputChange = useCallback((field, value) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleVolunteerInputChange = useCallback((field, value) => {
    setNewVolunteer((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAttendeeInputChange = useCallback((field, value) => {
    setNewAttendee((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleMessageInputChange = useCallback((field, value) => {
    setNewMessage((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle adding a group member to registration
  const addGroupMember = useCallback(() => {
    if (newGroupMember.name && newGroupMember.relationship) {
      setNewAttendee((prev) => ({
        ...prev,
        groupMembers: [...prev.groupMembers, { ...newGroupMember, checkedIn: false }],
      }));
      setNewGroupMember({ name: '', relationship: '' });
    }
  }, [newGroupMember]);

  // Handle removing a group member
  const removeGroupMember = useCallback((index) => {
    setNewAttendee((prev) => ({
      ...prev,
      groupMembers: prev.groupMembers.filter((_, i) => i !== index),
    }));
  }, []);

  // Handle adding custom question to event
  const addCustomQuestion = useCallback(() => {
    if (newQuestion.question) {
      setNewEvent((prev) => ({
        ...prev,
        customQuestions: [...prev.customQuestions, { ...newQuestion, id: Date.now() }],
      }));
      setNewQuestion({ question: '', type: 'text', required: false, options: [] });
    }
  }, [newQuestion]);

  // Handle removing custom question
  const removeCustomQuestion = useCallback((id) => {
    setNewEvent((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((q) => q.id !== id),
    }));
  }, []);

  // Apply event template
  const applyEventTemplate = useCallback((templateKey) => {
    const template = eventTemplates[templateKey];
    if (template) {
      setNewEvent((prev) => ({
        ...prev,
        name: template.name,
        eventType: template.eventType,
        customQuestions: template.customQuestions || [],
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
    const uniqueDonors = new Set(donations.map((d) => d.donorName));
    return uniqueDonors.size;
  }, [donations]);

  const getRecentPaymentsActivity = useCallback(() => {
    const allActivity = [
      ...payments.map((p) => ({
        id: p.id,
        type: 'payment',
        description: `Payment for ${p.eventName}`,
        eventName: p.eventName,
        amount: p.amount,
        status: p.status,
        date: p.date,
      })),
      ...donations.map((d) => ({
        id: d.id,
        type: 'donation',
        description: `Donation to ${d.campaign || 'General Fund'}`,
        donorName: d.donorName,
        amount: d.amount,
        status: 'completed',
        date: d.date,
      })),
    ];
    return allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, donations]);

  const filterPayments = useCallback((payments, searchTerm, filterStatus) => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.attendeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, []);

  const filterDonations = useCallback((donations, searchTerm, filterType) => {
    return donations.filter((donation) => {
      const matchesSearch =
        donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.campaign && donation.campaign.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || donation.campaign === filterType;
      return matchesSearch && matchesFilter;
    });
  }, []);

  const getPaymentStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#dc2626';
      case 'refunded':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }, []);

  const getMonthlyRevenueData = useCallback(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      amount: Math.random() * 5000 + 1000, // Mock data for now
    }));
  }, []);

  const getTopDonors = useCallback(() => {
    const donorTotals = {};
    donations.forEach((donation) => {
      if (!donorTotals[donation.donorName]) {
        donorTotals[donation.donorName] = 0;
      }
      donorTotals[donation.donorName] += donation.amount;
    });
    return Object.entries(donorTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [donations]);

  const handleViewPaymentDetails = useCallback(
    (payment) => {
      addNotification(
        `Payment: $${payment.amount} for ${payment.eventName} by ${payment.attendeeName} (${payment.status})`,
        'info'
      );
    },
    [addNotification]
  );

  const handleRefundPayment = useCallback(
    (paymentId) => {
      if (window.confirm('Are you sure you want to refund this payment?')) {
        setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, status: 'refunded' } : p)));
        addNotification('Payment refunded successfully!', 'success');
      }
    },
    [addNotification]
  );

  const handleViewDonationDetails = useCallback(
    (donation) => {
      addNotification(
        `Donation: $${donation.amount} from ${donation.donorName} to ${donation.campaign || 'General'}`,
        'info'
      );
    },
    [addNotification]
  );

  const handleSendThankYou = useCallback(
    (donation) => {
      addNotification(
        `Thank you email sent to ${donation.donorName} for their donation of $${donation.amount}!`,
        'success'
      );
    },
    [addNotification]
  );

  const exportPaymentsReport = useCallback(() => {
    const csv =
      'Event,Attendee,Amount,Status,Date\n' +
      payments.map((p) => `${p.eventName},${p.attendeeName},${p.amount},${p.status},${p.date}`).join('\n');
    downloadCSV(csv, 'payments-report.csv');
  }, [payments]);

  const exportDonationsReport = useCallback(() => {
    const csv =
      'Donor,Campaign,Amount,Date\n' +
      donations.map((d) => `${d.donorName},${d.campaign || 'General'},${d.amount},${d.date}`).join('\n');
    downloadCSV(csv, 'donations-report.csv');
  }, [donations]);

  const exportFinancialSummary = useCallback(() => {
    addNotification(
      'Financial summary PDF export would be generated here with charts and detailed breakdowns.',
      'info'
    );
  }, [addNotification]);

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
  const processPayment = useCallback(
    async (paymentData) => {
      try {
        // This would integrate with your chosen payment gateway
        logger.log('Processing payment:', paymentData);

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

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
          recipientEmail: paymentData.recipientEmail,
        };

        setPayments((prev) => [newPayment, ...prev]);
        setShowPaymentForm(false);
        setPaymentFormData({ amount: '', paymentMethod: 'stripe', description: '', recipientEmail: '' });

        addNotification(`Payment processed successfully! Transaction ID: ${newPayment.transactionId}`, 'success');

        // In real implementation, this would:
        // 1. Send payment to Stripe/PayPal/Square
        // 2. Transfer funds to recipient account
        // 3. Update payment status based on gateway response
      } catch (error) {
        logger.error('Payment processing failed:', error);
        addNotification('Payment failed. Please try again.', 'error');
      }
    },
    [addNotification]
  );

  const handlePaymentFormSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!paymentFormData.amount || !paymentFormData.description) {
        addNotification('Please fill in all required fields', 'error');
        return;
      }
      processPayment(paymentFormData);
    },
    [paymentFormData, processPayment, addNotification]
  );

  // Handle creating a new event
  const handleCreateEvent = useCallback(() => {
    // Validate form
    const errors = validateEventForm(newEvent);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addNotification('Please fix the following errors: ' + Object.values(errors).join(', '), 'error');
      return;
    }

    setFormErrors({}); // Clear errors

    if (newEvent.name) {
      const event = {
        id: Date.now(),
        name: newEvent.name,
        dateType: newEvent.dateType,
        dates: newEvent.dates.filter((d) => d),
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
        customQuestions: newEvent.customQuestions,
        requiredRoles: [],
      };

      setEvents((prev) => [...prev, event]);
      setNewEvent({
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
        customQuestions: [],
      });
      setSelectedTemplate('');
      setShowCreateEvent(false);
      setActiveTab('events');
      addNotification('Event created successfully!', 'success');
    } else {
      addNotification('Please fill in at least the Event Name', 'error');
    }
  }, [newEvent, addNotification]);

  // Handle editing an event
  const handleEditEvent = useCallback((event) => {
    setEditingEvent({
      ...event,
      dates: event.dates.length > 0 ? event.dates : [''],
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
      addNotification('Please fix the following errors: ' + Object.values(errors).join(', '), 'error');
      return;
    }

    setFormErrors({}); // Clear errors

    setEvents((prev) =>
      prev.map((event) =>
        event.id === editingEvent.id
          ? {
              ...editingEvent,
              dates: editingEvent.dates.filter((d) => d),
              capacity: parseInt(editingEvent.capacity) || 50,
              registrationFee: parseFloat(editingEvent.registrationFee) || 0,
              donationGoal: parseFloat(editingEvent.donationGoal) || 0,
            }
          : event
      )
    );

    setShowEditEvent(false);
    setEditingEvent(null);
    addNotification('Event updated successfully!', 'success');
  }, [editingEvent, addNotification]);

  // Handle closing/archiving an event
  const handleEventStatusChange = useCallback((eventId, newStatus) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, status: newStatus } : event)));
  }, []);

  // Handle deleting an archived event
  const handleDeleteEvent = useCallback((eventId) => {
    if (
      window.confirm('Are you sure you want to permanently delete this archived event? This action cannot be undone.')
    ) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setAttendees((prev) => prev.filter((a) => a.eventId !== eventId));
    }
  }, []);

  // Handle adding a new volunteer
  const handleAddVolunteer = useCallback(() => {
    // Validate form
    const errors = validateVolunteerForm(newVolunteer);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addNotification('Please fix the following errors: ' + Object.values(errors).join(', '), 'error');
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
        securityLevel: newVolunteer.securityLevel,
      };

      setVolunteers((prev) => [...prev, volunteer]);
      setNewVolunteer({ name: '', email: '', phone: '', role: '', securityLevel: 'volunteer' });
      setShowAddVolunteer(false);
      addNotification('Volunteer added successfully!', 'success');
    } else {
      addNotification('Please fill in the required fields: Name and Email', 'error');
    }
  }, [newVolunteer, addNotification]);

  // Handle event registration with group members
  const handleEventRegistration = useCallback(async () => {
    // Validate form
    const errors = validateAttendeeForm(newAttendee);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addNotification('Please fix the following errors: ' + Object.values(errors).join(', '), 'error');
      return;
    }

    setFormErrors({}); // Clear errors

    if (newAttendee.primaryName && newAttendee.email && selectedEvent) {
      const eventAttendees = attendees.filter((a) => a.eventId === selectedEvent.id);
      const totalPeopleInGroup = 1 + newAttendee.groupMembers.length;
      const totalRegistered = eventAttendees.reduce((sum, a) => sum + 1 + a.groupMembers.length, 0);

      if (totalRegistered + totalPeopleInGroup > selectedEvent.capacity) {
        addNotification(
          `Sorry, this event only has ${selectedEvent.capacity - totalRegistered} spots left!`,
          'warning'
        );
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
        customResponses: newAttendee.customResponses,
      };

      setAttendees((prev) => [...prev, attendee]);
      setNewAttendee({ primaryName: '', email: '', phone: '', groupMembers: [], customResponses: {} });
      setShowRegistration(false);

      const totalFee = selectedEvent.registrationFee * totalPeopleInGroup;
      addNotification(
        `Successfully registered ${totalPeopleInGroup} person(s) for ${selectedEvent.name}!${selectedEvent.registrationFee > 0 ? ` Total payment of $${totalFee} required.` : ''}`,
        'success'
      );

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
          logger.log('📧 Registration confirmation email sent to:', newAttendee.email);
        } catch (error) {
          logger.error('Failed to send registration confirmation email:', error);
        }
      }
    } else {
      addNotification('Please fill in the required fields: Name and Email', 'error');
    }
  }, [newAttendee, selectedEvent, attendees, notificationSettings.registrationConfirmation, addNotification]);

  // Handle editing an attendee
  const handleEditAttendee = useCallback((attendee) => {
    setSelectedAttendee(attendee);
    setShowEditAttendee(true);
  }, []);

  // Handle updating an attendee
  const handleUpdateAttendee = useCallback(() => {
    if (selectedAttendee) {
      setAttendees((prev) => prev.map((a) => (a.id === selectedAttendee.id ? selectedAttendee : a)));
      setShowEditAttendee(false);
      setSelectedAttendee(null);
      addNotification('Attendee updated successfully!', 'success');
    }
  }, [selectedAttendee, addNotification]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.subject || !newMessage.message) {
      addNotification('Please fill in the subject and message fields', 'error');
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
          const event = events.find((e) => e.id === parseInt(newMessage.eventId));
          recipientList = volunteers.filter((v) => event?.volunteers.includes(v.id));
          recipientDescription = `${event?.name} Volunteers`;
        }
        break;
      case 'event-attendees':
        if (newMessage.eventId) {
          const event = events.find((e) => e.id === parseInt(newMessage.eventId));
          recipientList = attendees.filter((a) => a.eventId === parseInt(newMessage.eventId));
          recipientDescription = `${event?.name} Attendees`;
        }
        break;
      default:
        break;
    }

    if (recipientList.length === 0) {
      addNotification('No recipients found for the selected criteria', 'warning');
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
          const event = events.find((e) => e.id === parseInt(newMessage.eventId));
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
        status: 'sent',
      };

      setCommunications((prev) => [communication, ...prev]);
      setNewMessage({
        type: 'announcement',
        recipients: 'all-volunteers',
        eventId: '',
        subject: '',
        message: '',
        sendVia: 'email',
      });
      setShowSendMessage(false);

      addNotification(`Email sent successfully to ${recipientList.length} recipient(s)!`, 'success');
    } catch (error) {
      logger.error('Failed to send emails:', error);
      addNotification('Failed to send some emails. Please try again.', 'error');
    } finally {
      // Reset button
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'Send Message';
      }
    }
  }, [newMessage, volunteers, attendees, events, addNotification]);

  // Apply message template
  const applyMessageTemplate = (templateKey) => {
    const template = messageTemplates[templateKey];
    if (template) {
      setNewMessage((prev) => ({
        ...prev,
        subject: template.subject,
        message: template.message,
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

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id === selectedEvent.id) {
          const isAssigned = event.volunteers.includes(volunteerId);
          const newVolunteers = isAssigned
            ? event.volunteers.filter((id) => id !== volunteerId)
            : [...event.volunteers, volunteerId];

          return { ...event, volunteers: newVolunteers };
        }
        return event;
      })
    );

    setSelectedEvent((prev) => {
      if (!prev) return null;
      const isAssigned = prev.volunteers.includes(volunteerId);
      const newVolunteers = isAssigned
        ? prev.volunteers.filter((id) => id !== volunteerId)
        : [...prev.volunteers, volunteerId];

      return { ...prev, volunteers: newVolunteers };
    });
  };

  // Handle attendee check-in (including group members)
  const toggleAttendeeCheckIn = (attendeeId, memberIndex = null) => {
    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id === attendeeId) {
          if (memberIndex !== null) {
            // Check in a group member
            const updatedGroupMembers = [...a.groupMembers];
            updatedGroupMembers[memberIndex] = {
              ...updatedGroupMembers[memberIndex],
              checkedIn: !updatedGroupMembers[memberIndex].checkedIn,
            };
            return { ...a, groupMembers: updatedGroupMembers };
          } else {
            // Check in primary attendee
            return { ...a, checkedIn: !a.checkedIn };
          }
        }
        return a;
      })
    );
  };

  // Handle notification settings change
  const toggleNotificationSetting = (setting) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Helper function to get event attendees
  const getEventAttendees = (eventId) => {
    return attendees.filter((a) => a.eventId === eventId);
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
  const sendVolunteerReminders = useCallback(
    async (eventId) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      const eventVolunteers = volunteers.filter((v) => event.volunteers.includes(v.id));

      if (eventVolunteers.length === 0) {
        addNotification('No volunteers assigned to this event', 'warning');
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
        addNotification(`Volunteer reminders sent to ${eventVolunteers.length} volunteer(s)!`, 'success');

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
          status: 'sent',
        };

        setCommunications((prev) => [communication, ...prev]);
      } catch (error) {
        logger.error('Failed to send volunteer reminders:', error);
        addNotification('Failed to send some volunteer reminders. Please try again.', 'error');
      }
    },
    [events, volunteers, addNotification]
  );

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
        }}
      >
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isDemo) {
    return <AuthScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex' }}>
      {/* Skip to content link */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          zIndex: 9999,
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          fontSize: '14px',
        }}
        onFocus={(e) => {
          e.target.style.left = '0';
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      {/* Notification System */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            role="alert"
            style={{
              backgroundColor:
                notification.type === 'success'
                  ? '#dcfce7'
                  : notification.type === 'error'
                    ? '#fef2f2'
                    : notification.type === 'warning'
                      ? '#fef3c7'
                      : '#dbeafe',
              color:
                notification.type === 'success'
                  ? '#166534'
                  : notification.type === 'error'
                    ? '#dc2626'
                    : notification.type === 'warning'
                      ? '#d97706'
                      : '#1d4ed8',
              border: `1px solid ${
                notification.type === 'success'
                  ? '#bbf7d0'
                  : notification.type === 'error'
                    ? '#fecaca'
                    : notification.type === 'warning'
                      ? '#fed7aa'
                      : '#bfdbfe'
              }`,
              borderRadius: '8px',
              padding: '12px 16px',
              minWidth: '300px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'slideIn 0.3s ease-out',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '12px',
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
      <aside
        style={{ width: '256px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb' }}
        aria-label="Main navigation"
      >
        <header style={{ padding: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>ChurchConnect</h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Event Manager</p>
        </header>

        <nav aria-label="Primary" style={{ marginTop: '24px' }}>
          {[
            { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp },
            { id: 'events', name: 'Events', icon: CalendarIcon },
            { id: 'volunteers', name: 'Volunteers', icon: Users },
            { id: 'attendees', name: 'Attendees', icon: User },
            { id: 'families', name: 'Families', icon: Home },
            { id: 'ministries', name: 'Ministries', icon: UsersRound },
            { id: 'bookings', name: 'Bookings', icon: Building },
            { id: 'payments', name: 'Giving', icon: Heart },
            { id: 'prayer', name: 'Prayer', icon: Heart },
            { id: 'media', name: 'Media', icon: PlayCircle },
            { id: 'workflows', name: 'Automations', icon: Zap },
            { id: 'communications', name: 'Communications', icon: Mail },
            { id: 'settings', name: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSearchTerm('');
                setFilterStatus('all');
              }}
              aria-current={activeTab === item.id ? 'page' : undefined}
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
                transition: 'all 0.2s',
              }}
            >
              <item.icon style={{ height: '20px', width: '20px', marginRight: '12px' }} aria-hidden="true" />
              {item.name}
            </button>
          ))}
        </nav>
        <UserMenu />
      </aside>

      {/* Main Content */}
      <main id="main-content" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>}>
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

          {activeTab === 'analytics' && (
            <AnalyticsView
              events={events}
              attendees={attendees}
              volunteers={volunteers}
              donations={donations}
              payments={payments}
              addNotification={addNotification}
            />
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
              addNotification={addNotification}
            />
          )}

          {activeTab === 'volunteers' && (
            <VolunteersView
              volunteers={volunteers}
              setVolunteers={setVolunteers}
              events={events}
              setEvents={setEvents}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterVolunteers={filterVolunteers}
              setShowAddVolunteer={setShowAddVolunteer}
              addNotification={addNotification}
              volunteerAvailability={volunteerAvailability}
              setVolunteerAvailability={setVolunteerAvailability}
            />
          )}

          {activeTab === 'attendees' && (
            <div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}
              >
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>All Attendees</h2>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {attendees.reduce((sum, a) => sum + 1 + a.groupMembers.length, 0)} total people •{' '}
                  {attendees.filter((a) => a.checkedIn).length +
                    attendees.reduce((sum, a) => sum + a.groupMembers.filter((m) => m.checkedIn).length, 0)}{' '}
                  checked in
                </div>
              </div>

              {events
                .filter((e) => e.status !== 'archived')
                .map((event) => {
                  const eventAttendees = getEventAttendees(event.id);
                  if (eventAttendees.length === 0) return null;

                  return (
                    <div
                      key={event.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginBottom: '20px',
                      }}
                    >
                      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>{event.name}</h3>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                          {formatEventDates(event)} • {getTotalPeopleCount(event.id)}/{event.capacity} registered
                        </p>
                      </div>
                      {eventAttendees.map((attendee, index) => (
                        <div
                          key={attendee.id}
                          style={{
                            padding: '16px 20px',
                            borderBottom: index < eventAttendees.length - 1 ? '1px solid #e5e7eb' : 'none',
                            backgroundColor: attendee.checkedIn ? '#f0f9ff' : 'white',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0' }}>
                                  {attendee.primaryName}
                                </h4>
                                {attendee.checkedIn && (
                                  <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />
                                )}
                              </div>
                              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px 0' }}>
                                {attendee.email}
                              </p>
                              {attendee.phone && (
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                                  {attendee.phone}
                                </p>
                              )}

                              {/* Group Members */}
                              {attendee.groupMembers.length > 0 && (
                                <div style={{ marginTop: '8px', paddingLeft: '16px', borderLeft: '2px solid #e5e7eb' }}>
                                  <p
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      color: '#6b7280',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    Group Members ({attendee.groupMembers.length}):
                                  </p>
                                  {attendee.groupMembers.map((member, memberIndex) => (
                                    <div
                                      key={memberIndex}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '4px',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '14px' }}>{member.name}</span>
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                          ({member.relationship})
                                        </span>
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
                                          fontWeight: 'bold',
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
                                <div
                                  style={{
                                    marginTop: '8px',
                                    padding: '8px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '4px',
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      color: '#6b7280',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    Responses:
                                  </p>
                                  {Object.entries(attendee.customResponses).map(([key, value]) => {
                                    const question = event.customQuestions?.find((q) => q.id === key);
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
                                <span
                                  style={{
                                    backgroundColor:
                                      attendee.paymentStatus === 'paid'
                                        ? '#dcfce7'
                                        : attendee.paymentStatus === 'pending'
                                          ? '#fef3c7'
                                          : '#f3f4f6',
                                    color:
                                      attendee.paymentStatus === 'paid'
                                        ? '#16a34a'
                                        : attendee.paymentStatus === 'pending'
                                          ? '#d97706'
                                          : '#6b7280',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                  }}
                                >
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
                                  fontWeight: 'bold',
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
                                  fontWeight: 'bold',
                                }}
                              >
                                {attendee.checkedIn ? 'Check Out' : 'Check In'}
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remove ${attendee.primaryName} from this event?`)) {
                                    setAttendees((prev) => prev.filter((a) => a.id !== attendee.id));
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
                                  fontWeight: 'bold',
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

          {activeTab === 'families' && (
            <FamiliesView
              families={families}
              setFamilies={setFamilies}
              householdMembers={householdMembers}
              setHouseholdMembers={setHouseholdMembers}
              addNotification={addNotification}
            />
          )}

          {activeTab === 'ministries' && (
            <MinistriesView
              ministries={ministries}
              setMinistries={setMinistries}
              events={events}
              addNotification={addNotification}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              rooms={rooms}
              setRooms={setRooms}
              resources={resources}
              setResources={setResources}
              roomBookings={roomBookings}
              setRoomBookings={setRoomBookings}
              events={events}
              addNotification={addNotification}
            />
          )}

          {activeTab === 'workflows' && (
            <WorkflowsView
              addNotification={addNotification}
              attendees={attendees}
              events={events}
              volunteers={volunteers}
            />
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
              addNotification={addNotification}
            />
          )}

          {activeTab === 'payments' && (
            <GivingView
              donations={donations}
              setDonations={setDonations}
              payments={payments}
              setPayments={setPayments}
              events={events}
              addNotification={addNotification}
            />
          )}

          {activeTab === 'prayer' && (
            <PrayerView prayerPosts={prayerPosts} setPrayerPosts={setPrayerPosts} addNotification={addNotification} />
          )}

          {activeTab === 'media' && (
            <MediaView
              mediaItems={mediaItems}
              setMediaItems={setMediaItems}
              events={events}
              addNotification={addNotification}
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
        </Suspense>
      </main>

      <Suspense fallback={null}>
        {/* Event Template Creation Modal */}
        {showCreateEventTemplate && (
          <EventTemplateCreationModal
            newEventTemplate={newEventTemplate}
            setNewEventTemplate={setNewEventTemplate}
            onClose={() => setShowCreateEventTemplate(false)}
            onCreate={() => {
              const templateKey = newEventTemplate.name.toLowerCase().replace(/\s+/g, '-');
              setEventTemplates((prev) => ({
                ...prev,
                [templateKey]: {
                  name: newEventTemplate.name,
                  eventType: newEventTemplate.eventType,
                  customQuestions: newEventTemplate.customQuestions,
                },
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
                customQuestions: [],
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
                type: newTemplate.type,
              };
              setNewTemplate({ name: '', subject: '', message: '', type: 'announcement' });
              setShowCreateTemplate(false);
              addNotification('Template created successfully!', 'success');
            }}
            addNotification={addNotification}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ChurchConnectDashboard;
