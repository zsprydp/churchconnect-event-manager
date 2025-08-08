# EmailJS Setup Guide for ChurchConnect Event Manager

## 🚀 Quick Setup for Real Email Functionality

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" (recommended for Gmail users)
4. Connect your Gmail account
5. Note your **Service ID** (starts with "service_")

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Name it "ChurchConnect Template"
4. Use this template code:

```html
<!DOCTYPE html>
<html>
<head>
    <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #3b82f6; margin: 0;">ChurchConnect Event Manager</h2>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #374151; margin-top: 0;">{{subject}}</h3>
            <div style="white-space: pre-wrap;">{{message}}</div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>This email was sent from ChurchConnect Event Manager</p>
            <p>If you have any questions, please contact your church administrator</p>
        </div>
    </div>
</body>
</html>
```

5. Save the template
6. Note your **Template ID** (starts with "template_")

### Step 4: Get Your User ID
1. Go to "Account" → "API Keys"
2. Copy your **User ID** (starts with "user_")

### Step 5: Update Configuration
1. Open `src/App.js`
2. Find the `emailJSConfig` object (around line 100)
3. Replace the placeholder values:

```javascript
const emailJSConfig = {
  serviceId: 'service_YOUR_SERVICE_ID', // Replace with your actual Service ID
  templateId: 'template_YOUR_TEMPLATE_ID', // Replace with your actual Template ID
  userId: 'user_YOUR_USER_ID' // Replace with your actual User ID
};
```

### Step 6: Test the Setup
1. Start your React app: `npm start`
2. Go to Communications tab
3. Click "Test Email" button
4. Check your Gmail inbox for the test email

## 🔧 Configuration Details

### Template Variables
The system uses these variables in your EmailJS template:
- `{{subject}}` - Email subject
- `{{message}}` - Email body content
- `{{to_email}}` - Recipient email (automatically handled by EmailJS)
- `{{from_email}}` - Sender email (automatically handled by EmailJS)

### Email Types Supported
1. **Registration Confirmations** - Sent when someone registers for an event
2. **Volunteer Reminders** - Sent to volunteers before events
3. **Event Updates** - Sent when event details change
4. **Donation Thank You** - Sent after donations
5. **Manual Messages** - Sent through the Communications tab

## 🛠️ Troubleshooting

### Issue: "EmailJS sending failed"
**Solutions:**
1. Check your Service ID, Template ID, and User ID are correct
2. Make sure your Gmail account is properly connected
3. Check EmailJS dashboard for any service errors
4. Verify your EmailJS account is active

### Issue: Emails not reaching Gmail
**Solutions:**
1. Check your Gmail spam folder
2. Add the sender email to your Gmail contacts
3. Check Gmail settings for filtering
4. Verify EmailJS service is properly configured

### Issue: Template not working
**Solutions:**
1. Make sure template variables are correctly named
2. Test template in EmailJS dashboard first
3. Check template syntax for errors
4. Verify template is published and active

## 📧 Testing Checklist

- [ ] EmailJS account created
- [ ] Gmail service connected
- [ ] Template created and saved
- [ ] Configuration updated in App.js
- [ ] Test email sent successfully
- [ ] Registration confirmation emails working
- [ ] Volunteer reminder emails working
- [ ] Manual emails working

## 🔒 Security Notes

- Never commit your EmailJS credentials to public repositories
- Use environment variables for production
- Monitor your EmailJS usage (free tier has limits)
- Regularly check EmailJS dashboard for any issues

## 📊 Usage Limits (Free Tier)

- 200 emails per month
- 2 email services
- 5 email templates
- Basic analytics

For higher limits, consider upgrading to a paid plan.

## 🎯 Next Steps

1. **Test all email types** in the application
2. **Customize email templates** for your church's branding
3. **Set up email automation** rules
4. **Monitor email delivery** and open rates
5. **Configure backup email service** if needed

Your ChurchConnect Event Manager now has real email functionality! 🎉
