# Spillover Referral System

## Overview
The spillover system automatically places referrals into downline positions when a user's direct referral slots are full. This creates a binary tree structure where excess referrals "spill over" to help build the team of existing members.

## How It Works

### 1. Direct Referrals (Positions 1-2)
- When someone uses your referral code, they are placed as your direct referral
- You earn the full referral bonus
- They appear in your team dashboard

### 2. Spillover Referrals (Position 3+)
When you refer a 3rd person (or more):
- The system finds the first available slot in your downline (starting from left)
- The new member is placed under one of your existing team members
- **The placement parent receives:**
  - Email notification about the spillover member
  - In-app notification in their dashboard
  - The member appears in their team view
  - **Note:** They do NOT receive the referral bonus
  
- **You (the original referrer) receive:**
  - The full referral bonus
  - Credit for the referral in your earnings

## Example Scenario

**User A** refers 3 people:
1. **Person 1** → Placed directly under User A (left position)
2. **Person 2** → Placed directly under User A (right position)
3. **Person 3** → Spills over to Person 1 (User A's left downline)

**What happens:**
- **Person 1** receives:
  - Email: "New Spillover Member! Person 3 has been placed in your downline through spillover from User A"
  - Dashboard notification
  - Person 3 appears in their team view (marked as spillover)
  
- **User A** receives:
  - Full referral bonus for Person 3
  - Person 3 counts toward their matrix completion

## Database Structure

### spillover_referrals Table
```sql
- original_referrer_id: The person who actually referred the new member
- placement_parent_id: The person under whom the new member was placed
- referred_user_id: The new member who was placed
- stage: The MLM stage at which the placement occurred
- created_at: Timestamp of the spillover
```

## Email Notifications

### Spillover Notification Email
Sent to the placement parent when a spillover member is placed in their downline:
- Subject: "New Spillover Member in Your Team!"
- Contains:
  - Name of the spillover member
  - Name of the original referrer
  - Explanation that bonus goes to original referrer
  - Link to view team dashboard

## Dashboard Display

### Team View
Members see both:
1. **Direct Referrals** (is_spillover: false)
   - Shows earning amount
   - Full team member details
   
2. **Spillover Referrals** (is_spillover: true)
   - Marked as "Spillover"
   - Shows original referrer name
   - Earning shows as 0 (bonus goes to original referrer)
   - Helps visualize complete team structure

## Benefits

### For Original Referrer
- Unlimited earning potential
- All referrals count toward matrix completion
- Bonuses for all referrals regardless of placement

### For Placement Parent
- Team grows automatically through spillover
- Helps fill matrix positions
- Builds deeper team structure
- No effort required to receive spillover members

### For the System
- Encourages active recruitment
- Rewards top performers
- Creates balanced team growth
- Maintains fair compensation structure

## Implementation Files

### Backend Files Modified
1. `backend/src/utils/emailService.js`
   - Added `sendSpilloverNotificationEmail()` function

2. `backend/src/services/mlmService.js`
   - Modified `placeInMatrixWithSpillover()` to detect and handle spillover
   - Updated `getTeamMembers()` to include spillover referrals
   - Added spillover tracking and notifications

3. `backend/database/migrations/add-spillover-tracking.sql`
   - New table for tracking spillover relationships

### Migration Script
- `backend/apply-spillover-migration.js`
  - Run this to apply the database changes

## Setup Instructions

1. **Apply Database Migration**
   ```bash
   cd backend
   node apply-spillover-migration.js
   ```

2. **Restart Backend Server**
   ```bash
   npm run dev
   ```

3. **Test the System**
   - Register 3+ users with the same referral code
   - Check that the 3rd user triggers spillover
   - Verify email and dashboard notifications

## API Response Changes

### GET /api/mlm/team
Now returns members with additional fields:
```json
{
  "team": [
    {
      "id": 123,
      "full_name": "John Doe",
      "is_spillover": false,
      "earning_from_user": 1.5,
      "original_referrer_name": null
    },
    {
      "id": 456,
      "full_name": "Jane Smith",
      "is_spillover": true,
      "earning_from_user": 0,
      "original_referrer_name": "Bob Johnson"
    }
  ]
}
```

## Frontend Integration

To display spillover members in the UI:

```javascript
// Check if member is spillover
if (member.is_spillover) {
  // Show spillover badge
  // Display original referrer name
  // Show earning as 0 or "N/A"
  // Add tooltip: "Bonus goes to {original_referrer_name}"
}
```

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] 3rd referral triggers spillover placement
- [ ] Placement parent receives email notification
- [ ] Placement parent sees in-app notification
- [ ] Spillover member appears in placement parent's team
- [ ] Original referrer receives the bonus
- [ ] Team dashboard shows spillover indicator
- [ ] Email template displays correctly
- [ ] Spillover data persists in database

## Support

For questions or issues with the spillover system:
- Email: info@baobaworldwide.com
- Check logs for spillover notifications
- Verify database entries in `spillover_referrals` table
