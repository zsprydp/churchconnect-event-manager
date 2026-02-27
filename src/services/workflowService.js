import { mockEmailService } from './emailService';
import logger from '../utils/logger';

const WORKFLOWS_KEY = 'workflows';
const WORKFLOW_LOG_KEY = 'workflow_log';

const DEFAULT_WORKFLOWS = [
  {
    id: 'first-time-guest',
    name: 'First-Time Guest Welcome',
    trigger: 'first_checkin',
    enabled: true,
    actions: [
      { type: 'send_email', template: 'welcome', delay: 0 },
      { type: 'notify_staff', message: 'New first-time guest: {name}', delay: 0 },
      { type: 'send_email', template: 'followup', delay: 3 },
    ],
  },
  {
    id: 'registration-confirm',
    name: 'Registration Confirmation',
    trigger: 'registration',
    enabled: true,
    actions: [{ type: 'send_email', template: 'registration-confirmation', delay: 0 }],
  },
  {
    id: 'absent-member',
    name: 'We Miss You',
    trigger: 'absent_weeks',
    triggerValue: 2,
    enabled: true,
    actions: [
      { type: 'send_email', template: 'we-miss-you', delay: 0 },
      { type: 'notify_staff', message: '{name} has been absent for {weeks} weeks', delay: 0 },
    ],
  },
  {
    id: 'volunteer-reminder',
    name: 'Volunteer Reminder (24h)',
    trigger: 'event_upcoming',
    triggerValue: 24,
    enabled: true,
    actions: [{ type: 'send_email', template: 'volunteer-reminder', delay: 0 }],
  },
];

const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Our Church!',
    message:
      'Dear {name},\n\nWelcome! We are so glad you joined us. We hope you felt at home and look forward to seeing you again soon.\n\nBlessings,\nChurch Connect Team',
  },
  followup: {
    subject: 'We Loved Having You!',
    message:
      "Dear {name},\n\nThank you for visiting us! We'd love to help you get connected. Feel free to reach out if you have any questions.\n\nBlessings,\nChurch Connect Team",
  },
  'registration-confirmation': {
    subject: 'Registration Confirmed - {eventName}',
    message:
      'Dear {name},\n\nYour registration has been confirmed!\n\nWe look forward to seeing you there.\n\nBest regards,\nChurch Connect Team',
  },
  'we-miss-you': {
    subject: 'We Miss You!',
    message:
      "Dear {name},\n\nWe've noticed you haven't been with us recently and just wanted to let you know you're missed. We'd love to see you again soon!\n\nBlessings,\nChurch Connect Team",
  },
  'volunteer-reminder': {
    subject: 'Volunteer Reminder - {eventName}',
    message:
      "Dear {name},\n\nThis is a reminder that you're scheduled to volunteer in 24 hours. Please arrive 30 minutes early.\n\nThank you for your service!\n\nBlessings,\nChurch Connect Team",
  },
};

export function getWorkflows() {
  try {
    const stored = localStorage.getItem(WORKFLOWS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error('Failed to load workflows from localStorage:', error);
  }
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(DEFAULT_WORKFLOWS));
  return DEFAULT_WORKFLOWS;
}

export function saveWorkflows(workflows) {
  try {
    localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
    return true;
  } catch (error) {
    logger.error('Failed to save workflows to localStorage:', error);
    return false;
  }
}

function getWorkflowLog() {
  try {
    const stored = localStorage.getItem(WORKFLOW_LOG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    logger.error('Failed to load workflow log:', error);
  }
  return [];
}

function addLogEntry(entry) {
  const log = getWorkflowLog();
  log.unshift(entry);
  const trimmed = log.slice(0, 100);
  try {
    localStorage.setItem(WORKFLOW_LOG_KEY, JSON.stringify(trimmed));
  } catch (error) {
    logger.error('Failed to save workflow log:', error);
  }
  return trimmed;
}

export { getWorkflowLog };

export async function executeWorkflow(workflowId, context) {
  const workflows = getWorkflows();
  const workflow = workflows.find((w) => w.id === workflowId);

  if (!workflow) {
    logger.error('Workflow not found:', workflowId);
    return { success: false, error: 'Workflow not found' };
  }

  if (!workflow.enabled) {
    logger.log('Workflow is disabled:', workflow.name);
    return { success: false, error: 'Workflow is disabled' };
  }

  const results = [];

  for (const action of workflow.actions) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      workflowId: workflow.id,
      workflowName: workflow.name,
      trigger: workflow.trigger,
      actionType: action.type,
      recipient: context.name || context.email || 'Unknown',
      status: 'pending',
    };

    try {
      if (action.type === 'send_email') {
        const template = EMAIL_TEMPLATES[action.template] || {
          subject: 'Notification',
          message: 'You have a new notification.',
        };

        let subject = template.subject;
        let message = template.message;

        subject = subject.replace(/{name}/g, context.name || 'Member');
        subject = subject.replace(/{eventName}/g, context.eventName || 'Event');
        message = message.replace(/{name}/g, context.name || 'Member');
        message = message.replace(/{eventName}/g, context.eventName || 'Event');
        message = message.replace(/{weeks}/g, context.weeks || '');

        const email = context.email || 'member@example.com';

        if (action.delay > 0) {
          logger.log(`Scheduled email "${subject}" to ${email} in ${action.delay} day(s)`);
          logEntry.status = 'scheduled';
          logEntry.detail = `Scheduled for ${action.delay} day(s) later`;
        } else {
          await mockEmailService.sendEmail(email, subject, message);
          logEntry.status = 'sent';
        }
      } else if (action.type === 'notify_staff') {
        let staffMessage = action.message;
        staffMessage = staffMessage.replace(/{name}/g, context.name || 'Member');
        staffMessage = staffMessage.replace(/{weeks}/g, context.weeks || '');
        logger.log('Staff notification:', staffMessage);
        logEntry.status = 'sent';
        logEntry.detail = staffMessage;
      }
    } catch (error) {
      logger.error('Workflow action failed:', error);
      logEntry.status = 'failed';
      logEntry.detail = error.message;
    }

    addLogEntry(logEntry);
    results.push(logEntry);
  }

  return { success: true, results };
}

export function checkAbsentMembers(attendees, events) {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const memberLastSeen = {};

  attendees.forEach((attendee) => {
    const event = events.find((e) => e.id === attendee.eventId);
    if (!event || !attendee.checkedIn) return;

    const eventDate = event.dates && event.dates.length > 0 ? new Date(event.dates[event.dates.length - 1]) : null;

    if (!eventDate) return;

    const key = attendee.email || attendee.primaryName;
    if (!memberLastSeen[key] || eventDate > memberLastSeen[key].date) {
      memberLastSeen[key] = {
        date: eventDate,
        name: attendee.primaryName,
        email: attendee.email,
      };
    }
  });

  const absentMembers = [];
  Object.values(memberLastSeen).forEach((member) => {
    if (member.date < twoWeeksAgo) {
      const weeksDiff = Math.floor((now - member.date) / (7 * 24 * 60 * 60 * 1000));
      absentMembers.push({
        name: member.name,
        email: member.email,
        lastSeen: member.date.toISOString(),
        weeksAbsent: weeksDiff,
      });
    }
  });

  return absentMembers;
}
