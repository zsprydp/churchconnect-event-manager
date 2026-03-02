import emailjs from '@emailjs/browser';
import logger from '../utils/logger';

const emailJSConfig = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
  templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
  userId: process.env.REACT_APP_EMAILJS_USER_ID || '',
};

if (emailJSConfig.userId) {
  emailjs.init(emailJSConfig.userId);
}

const sendEmailViaSimpleService = async (to, subject, message, from = 'church@example.com') => {
  try {
    logger.log('📧 Sending email via simple service:', { to, subject, messageLength: message.length });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.log('✅ Email would be sent to:', to);
    logger.log('📧 Subject:', subject);
    logger.log('📝 Message preview:', message.substring(0, 100) + '...');

    logger.log('💡 To get real emails working:');
    logger.log('   1. Follow EMAILJS_SETUP.md guide');
    logger.log(
      '   2. Set REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, and REACT_APP_EMAILJS_USER_ID in your .env file'
    );
    logger.log('   3. Or use a different email service');

    return { success: true, messageId: Date.now() };
  } catch (error) {
    logger.error('❌ Email sending failed:', error);
    throw error;
  }
};

const sendEmailViaEmailJS = async (to, subject, message, from = 'church@example.com') => {
  if (!emailJSConfig.serviceId || !emailJSConfig.templateId || !emailJSConfig.userId) {
    logger.log('📧 EmailJS not configured, using fallback service...');
    return await sendEmailViaSimpleService(to, subject, message, from);
  }

  try {
    logger.log('📧 Sending email via EmailJS:', { to, subject, messageLength: message.length });

    const templateParams = {
      to_email: to,
      subject: subject,
      message: message,
      from_email: from,
    };

    const result = await emailjs.send(emailJSConfig.serviceId, emailJSConfig.templateId, templateParams);

    logger.log('✅ Real email sent successfully via EmailJS:', result);
    return { success: true, messageId: result.text };
  } catch (error) {
    logger.error('❌ EmailJS sending failed:', error);
    logger.log('🔄 Falling back to simple service...');
    return await sendEmailViaSimpleService(to, subject, message, from);
  }
};

export const mockEmailService = {
  sendEmail: async (to, subject, message, from = 'church@example.com') => {
    if (!to || !subject || !message) {
      logger.error('❌ Email validation failed:', { to, subject, message });
      throw new Error('Missing required email parameters');
    }

    logger.log('📧 Attempting to send email:', { to, subject, messageLength: message.length });

    try {
      return await sendEmailViaEmailJS(to, subject, message, from);
    } catch (error) {
      logger.log('🔄 EmailJS failed, using fallback service...');
      return await sendEmailViaSimpleService(to, subject, message, from);
    }
  },
};

export const enhancedMessageTemplates = {
  'registration-confirmation': {
    subject: 'Registration Confirmed - {eventName}',
    message: `Dear {name},

Thank you for registering for {eventName}!

Event Details:
📅 Date: {eventDate}
📍 Location: {eventLocation}
💰 Fee: {eventFee}

We look forward to seeing you there!

Best regards,
Church Connect Team

---
This is an automated message from ChurchConnect Event Manager.`,
  },
  'volunteer-reminder': {
    subject: 'Volunteer Reminder - {eventName}',
    message: `Dear {name},

This is a friendly reminder that you're scheduled to volunteer for {eventName} tomorrow.

Event Details:
📅 Date: {eventDate}
📍 Location: {eventLocation}
⏰ Please arrive 30 minutes early

Thank you for your service to our community!

Blessings,
Church Connect Team

---
This is an automated message from ChurchConnect Event Manager.`,
  },
  'event-update': {
    subject: 'Important Update - {eventName}',
    message: `Dear {name},

We have an important update regarding {eventName}:

{updateMessage}

If you have any questions, please don't hesitate to contact us.

Best regards,
Church Connect Team

---
This is an automated message from ChurchConnect Event Manager.`,
  },
  'donation-thank-you': {
    subject: 'Thank You for Your Donation',
    message: `Dear {name},

Thank you for your generous donation of {amount} to {eventName}.

Your support helps us continue our mission and serve our community.

We are truly grateful for your generosity.

Blessings,
Church Connect Team

---
This is an automated message from ChurchConnect Event Manager.`,
  },
};
