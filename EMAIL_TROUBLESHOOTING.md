# Email Functionality Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: "Test Email" button doesn't work

**Symptoms:**
- Button doesn't respond when clicked
- No console output
- No alert message

**Solutions:**
1. **Check browser console** (F12 → Console tab)
2. **Make sure the app is running** on localhost:3000
3. **Try refreshing the page**
4. **Check if JavaScript errors are blocking execution**

### Issue 2: No console output when sending emails

**Symptoms:**
- No "📧 Mock Email Sent:" messages in console
- Emails appear to send but no feedback

**Solutions:**
1. **Open browser console** (F12 → Console tab)
2. **Clear console** and try again
3. **Check for JavaScript errors** that might be blocking execution

### Issue 3: Registration confirmation emails not sending

**Symptoms:**
- Registration works but no confirmation email
- No console output for confirmation emails

**Solutions:**
1. **Check notification settings** - Go to Communications → Automation
2. **Make sure "Registration Confirmation" is enabled**
3. **Check console for any errors**

### Issue 4: Volunteer reminder emails not working

**Symptoms:**
- Bell icon doesn't appear on events
- Clicking bell icon does nothing

**Solutions:**
1. **Make sure volunteers are assigned** to the event
2. **Check if the event has volunteers** (bell icon only appears if volunteers are assigned)
3. **Try assigning a volunteer first**, then click the bell

## 🧪 Testing Steps

### Step 1: Basic Email Test
1. Open the app in your browser
2. Go to **Communications** tab
3. Click **"Test Email"** button
4. Check for:
   - Alert message saying "✅ Test email sent!"
   - Console message: "📧 Mock Email Sent: {...}"
   - 1-second delay before the alert

### Step 2: Registration Confirmation Test
1. Go to **Events** tab
2. Click **"Register"** on any event
3. Fill out the registration form
4. Submit the registration
5. Check console for confirmation email details

### Step 3: Volunteer Reminder Test
1. Go to **Events** tab
2. Click **"Manage"** on an event
3. Assign a volunteer to the event
4. Go back to Events tab
5. Click the **bell icon** next to "Manage"
6. Check console for reminder email details

### Step 4: Manual Email Test
1. Go to **Communications** tab
2. Click **"Send Message"**
3. Fill out the form and send
4. Check console for email details

## 🔍 Debugging Information

### Console Output Examples

**Successful Test Email:**
```
📧 Mock Email Sent: {
  to: "test@example.com",
  subject: "Test Email",
  message: "This is a test email from ChurchConnect Event Manager."
}
```

**Successful Registration Confirmation:**
```
📧 Mock Email Sent: {
  to: "john@email.com",
  subject: "Registration Confirmed - Youth Summer Retreat",
  message: "Dear John Smith,\n\nThank you for registering..."
}
```

### Common Error Messages

**If you see no console output:**
- JavaScript might be disabled
- There might be a syntax error preventing execution
- The email service might not be properly initialized

**If you see errors in console:**
- Check the error message for clues
- Make sure all template variables are properly defined
- Verify the email service is working

## 🛠️ Manual Testing Commands

You can test the email service directly in the browser console:

```javascript
// Test the mock email service
mockEmailService.sendEmail('test@example.com', 'Test Subject', 'Test Message')
  .then(result => console.log('Email sent:', result))
  .catch(error => console.error('Email failed:', error));
```

## 📞 Getting Help

If you're still having issues:

1. **Check the browser console** for any error messages
2. **Try the manual testing commands** above
3. **Make sure the app is running** on localhost:3000
4. **Try a different browser** to rule out browser-specific issues
5. **Check if JavaScript is enabled** in your browser

## 🎯 Expected Behavior

When working correctly, you should see:
- ✅ Alert messages confirming email sending
- 📧 Console logs with email details
- ⏱️ 1-second delay before confirmation (simulating real email sending)
- 📊 Communication history updated with sent emails
- 🔔 Bell icons on events with assigned volunteers 