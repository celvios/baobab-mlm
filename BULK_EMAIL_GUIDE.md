# 📧 Bulk Email Management System

## ✅ System Updated to SendGrid

The bulk email system now uses **SendGrid** (same as all other emails) for reliable delivery.

---

## 🎯 How to Send Bulk Emails

### Via Admin Dashboard:

1. **Login to Admin Panel**
   - Go to: `https://baobab-frontend.vercel.app/admin`
   - Login with admin credentials

2. **Navigate to Email Management**
   - Click on "Emailer" or "Email Management" in sidebar

3. **Compose Your Email**
   - **Subject**: Enter email subject
   - **Message**: Type your message (supports line breaks)
   - **Template**: Choose template type:
     - `default` - Standard email
     - `announcement` - For announcements
     - `promotion` - For promotions/offers

4. **Select Recipients**
   - **All Users** - Send to everyone
   - **By Level** - Filter by MLM level:
     - Feeder
     - Bronze
     - Silver
     - Gold
     - Diamond
   - **Specific Users** - Select individual users

5. **Send Email**
   - Click "Send Email" button
   - System will send to all selected recipients
   - You'll see success/failure count

---

## 🔧 API Endpoint (For Testing)

### Send Bulk Email:
```bash
POST https://baobab-mlm.onrender.com/api/admin/bulk-email
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_ADMIN_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "subject": "Important Update",
  "message": "Hello {name},\n\nThis is a test message to all users.\n\nBest regards,\nBaobab Team",
  "category": "all",
  "template": "default"
}
```

**Category Options:**
- `"all"` - All active users
- `"feeder"` - Feeder level users
- `"bronze"` - Bronze level users
- `"silver"` - Silver level users
- `"gold"` - Gold level users
- `"diamond"` - Diamond level users

**Template Options:**
- `"default"` - Standard email template
- `"announcement"` - Announcement template with special styling
- `"promotion"` - Promotion template with CTA button

**Response:**
```json
{
  "message": "Bulk email completed: 45 sent, 0 failed",
  "emailId": 123,
  "successCount": 45,
  "failedCount": 0,
  "totalRecipients": 45,
  "failedEmails": []
}
```

---

## 📊 Email Statistics

### Get Email Stats:
```bash
GET https://baobab-mlm.onrender.com/api/admin/email-stats
```

**Response:**
```json
{
  "emailStats": {
    "total_emails": 10,
    "successful_emails": 8,
    "failed_emails": 1,
    "partial_emails": 1,
    "total_sent": 450,
    "total_failed": 5,
    "emails_this_week": 3,
    "emails_this_month": 10
  },
  "userStats": {
    "total_users": 100,
    "active_users": 95,
    "feeder_users": 50,
    "bronze_users": 30,
    "silver_users": 10,
    "gold_users": 4,
    "diamond_users": 1
  }
}
```

---

## 🎨 Email Templates

### 1. Default Template
Professional email with Baobab branding:
- Green header with logo
- Clean content area
- "Visit Dashboard" button
- Footer with copyright

### 2. Announcement Template
Special styling for important announcements:
- Highlighted announcement box
- Professional formatting
- Clear call-to-action

### 3. Promotion Template
Eye-catching design for promotions:
- Gradient header
- Large CTA button
- Promotional styling

---

## 🔄 Personalization

Use `{name}` in your message to personalize:

**Example:**
```
Hello {name},

We have exciting news for you!

Your current level: {level}
```

**Result:**
```
Hello John Doe,

We have exciting news for you!

Your current level: Bronze
```

---

## ⚡ Sending Process

### How It Works:
1. **Validation** - Checks if SendGrid is configured
2. **Recipient Selection** - Queries database for recipients
3. **Email Storage** - Saves email to history
4. **Batch Sending** - Sends in batches of 10
5. **Progress Tracking** - Tracks success/failure
6. **Status Update** - Updates email history
7. **Admin Log** - Logs activity

### Batch Processing:
- Sends 10 emails at a time
- 1-second delay between batches
- Prevents rate limiting
- Ensures reliable delivery

---

## 📈 Rate Limits

### SendGrid Free Tier:
- **100 emails/day**
- **3,000 emails/month**

### Recommendations:
- For 100+ users: Upgrade to SendGrid Essentials ($19.95/month)
- For 1000+ users: Upgrade to SendGrid Pro ($89.95/month)

---

## 🧪 Testing

### Test with Small Group:
1. Create test email
2. Select "Specific Users"
3. Choose 2-3 test users
4. Send and verify delivery

### Test All Templates:
```bash
# Default Template
{
  "subject": "Test Default Template",
  "message": "This is a test message.",
  "template": "default"
}

# Announcement Template
{
  "subject": "Important Announcement",
  "message": "We have an important update for you.",
  "template": "announcement"
}

# Promotion Template
{
  "subject": "Special Offer!",
  "message": "Limited time offer - don't miss out!",
  "template": "promotion"
}
```

---

## ✅ Success Indicators

### Email Sent Successfully:
- ✅ Success count matches recipient count
- ✅ Failed count is 0
- ✅ Status shows "sent"
- ✅ Recipients receive emails

### Check SendGrid Dashboard:
- View sent emails
- Check delivery rates
- Monitor bounces
- Track opens (if enabled)

---

## 🚨 Troubleshooting

### Emails Not Sending:
1. Check SendGrid API key is set in Render
2. Verify FROM_EMAIL is verified in SendGrid
3. Check SendGrid dashboard for errors
4. Review backend logs

### Some Emails Failed:
1. Check failed email addresses
2. Verify email addresses are valid
3. Check if users marked as inactive
4. Review SendGrid activity log

### Rate Limit Exceeded:
1. Check SendGrid daily limit
2. Upgrade plan if needed
3. Schedule emails across multiple days
4. Use batch sending feature

---

## 📝 Best Practices

### 1. Subject Lines:
- Keep under 50 characters
- Be clear and specific
- Avoid spam trigger words
- Use emojis sparingly

### 2. Message Content:
- Keep it concise
- Use clear formatting
- Include call-to-action
- Personalize with {name}

### 3. Timing:
- Send during business hours
- Avoid weekends for important emails
- Consider user time zones
- Don't send too frequently

### 4. Testing:
- Always test with small group first
- Check all templates
- Verify links work
- Test on mobile devices

---

## 📊 Email History

All sent emails are stored in `email_history` table:
- Subject and message
- Recipient count
- Success/failure counts
- Send timestamp
- Admin who sent it

**View History:**
- Admin dashboard → Email Management → History
- Shows all past bulk emails
- Filter by status
- View detailed stats

---

## 🎯 Use Cases

### 1. Welcome New Users:
```
Subject: Welcome to Baobab Community!
Category: feeder
Template: default
```

### 2. Announce New Features:
```
Subject: 🎉 New Features Available!
Category: all
Template: announcement
```

### 3. Promote Products:
```
Subject: 🔥 Limited Time Offer!
Category: all
Template: promotion
```

### 4. Level-Specific Updates:
```
Subject: Bronze Level Exclusive Update
Category: bronze
Template: default
```

---

## ✅ Summary

**Status:** ✅ FULLY FUNCTIONAL

**Features:**
- ✅ SendGrid integration
- ✅ Batch sending (10 at a time)
- ✅ Multiple templates
- ✅ Recipient filtering
- ✅ Personalization
- ✅ Email history
- ✅ Success/failure tracking
- ✅ Admin activity logging

**Ready to Use:** YES! 🚀

Test it now by sending a bulk email to all users from the admin panel!
