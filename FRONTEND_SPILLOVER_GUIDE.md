# Frontend Integration Guide - Spillover System

## Overview
This guide helps you integrate the spillover system into the frontend UI.

## API Changes

### GET /api/mlm/team

**New Response Fields:**
```javascript
{
  "team": [
    {
      "id": 123,
      "full_name": "John Doe",
      "email": "john@example.com",
      "mlm_level": "feeder",
      "is_active": true,
      "created_at": "2025-01-15T10:30:00Z",
      "referral_code": "ABC123",
      "earning_from_user": 1.5,
      "has_deposited": true,
      
      // NEW FIELDS
      "is_spillover": false,              // true if this is a spillover member
      "original_referrer_name": null,     // name of original referrer (for spillover)
      
      "children": []
    }
  ]
}
```

## UI Components

### 1. Team Member Card

#### Direct Referral (is_spillover: false)
```jsx
<div className="team-member-card">
  <div className="member-header">
    <h3>{member.full_name}</h3>
    <span className="badge badge-success">Direct Referral</span>
  </div>
  <div className="member-details">
    <p>Email: {member.email}</p>
    <p>Level: {member.mlm_level}</p>
    <p className="earning">Earned: ${member.earning_from_user}</p>
  </div>
</div>
```

#### Spillover Referral (is_spillover: true)
```jsx
<div className="team-member-card spillover">
  <div className="member-header">
    <h3>{member.full_name}</h3>
    <span className="badge badge-info">Spillover</span>
  </div>
  <div className="member-details">
    <p>Email: {member.email}</p>
    <p>Level: {member.mlm_level}</p>
    <p className="spillover-note">
      <i className="icon-info"></i>
      Referred by: <strong>{member.original_referrer_name}</strong>
    </p>
    <p className="earning-note">
      Earning: N/A 
      <span className="tooltip">
        Bonus goes to {member.original_referrer_name}
      </span>
    </p>
  </div>
</div>
```

### 2. Team List View

```jsx
function TeamList({ members }) {
  return (
    <div className="team-list">
      <h2>My Team ({members.length})</h2>
      
      {/* Direct Referrals Section */}
      <div className="direct-referrals">
        <h3>Direct Referrals</h3>
        {members.filter(m => !m.is_spillover).map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
      
      {/* Spillover Referrals Section */}
      {members.some(m => m.is_spillover) && (
        <div className="spillover-referrals">
          <h3>Spillover Members</h3>
          <p className="info-text">
            These members were placed in your downline by their original referrers.
            They help grow your team, but bonuses go to the original referrers.
          </p>
          {members.filter(m => m.is_spillover).map(member => (
            <TeamMemberCard key={member.id} member={member} isSpillover />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. Team Statistics

```jsx
function TeamStats({ members }) {
  const directCount = members.filter(m => !m.is_spillover).length;
  const spilloverCount = members.filter(m => m.is_spillover).length;
  const totalEarnings = members
    .filter(m => !m.is_spillover)
    .reduce((sum, m) => sum + m.earning_from_user, 0);
  
  return (
    <div className="team-stats">
      <div className="stat-card">
        <h4>Direct Referrals</h4>
        <p className="stat-value">{directCount}</p>
      </div>
      
      <div className="stat-card">
        <h4>Spillover Members</h4>
        <p className="stat-value">{spilloverCount}</p>
        <p className="stat-note">Helping grow your team</p>
      </div>
      
      <div className="stat-card">
        <h4>Total Earnings</h4>
        <p className="stat-value">${totalEarnings.toFixed(2)}</p>
        <p className="stat-note">From direct referrals</p>
      </div>
    </div>
  );
}
```

### 4. Notification Display

When user logs in and has spillover notifications:

```jsx
function SpilloverNotification({ notification }) {
  return (
    <div className="notification spillover-notification">
      <div className="notification-icon">
        <i className="icon-users"></i>
      </div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="notification-time">
          {formatTime(notification.created_at)}
        </span>
      </div>
    </div>
  );
}
```

## Styling Suggestions

### CSS Classes

```css
/* Spillover Badge */
.badge-info {
  background-color: #17a2b8;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* Spillover Card */
.team-member-card.spillover {
  border-left: 4px solid #17a2b8;
  background-color: #f8f9fa;
}

/* Spillover Note */
.spillover-note {
  color: #6c757d;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.spillover-note strong {
  color: #17a2b8;
}

/* Earning Note with Tooltip */
.earning-note {
  position: relative;
  color: #6c757d;
}

.earning-note .tooltip {
  display: none;
  position: absolute;
  background: #333;
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
}

.earning-note:hover .tooltip {
  display: block;
}

/* Spillover Section */
.spillover-referrals {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e9ecef;
}

.spillover-referrals .info-text {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px;
  margin-bottom: 16px;
  color: #856404;
}
```

## Example Implementation

### React Component

```jsx
import React, { useEffect, useState } from 'react';
import apiService from '../services/api';

function TeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await apiService.getTeam();
      setTeam(response.team);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const directReferrals = team.filter(m => !m.is_spillover);
  const spilloverMembers = team.filter(m => m.is_spillover);

  return (
    <div className="team-page">
      <h1>My Team</h1>
      
      {/* Statistics */}
      <div className="stats-grid">
        <StatCard 
          title="Direct Referrals" 
          value={directReferrals.length}
          icon="users"
        />
        <StatCard 
          title="Spillover Members" 
          value={spilloverMembers.length}
          icon="share"
          color="info"
        />
        <StatCard 
          title="Total Team" 
          value={team.length}
          icon="network"
        />
      </div>

      {/* Direct Referrals */}
      <section className="team-section">
        <h2>Direct Referrals ({directReferrals.length})</h2>
        <div className="team-grid">
          {directReferrals.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      {/* Spillover Members */}
      {spilloverMembers.length > 0 && (
        <section className="team-section spillover-section">
          <h2>Spillover Members ({spilloverMembers.length})</h2>
          <div className="info-banner">
            <i className="icon-info-circle"></i>
            <p>
              These members were placed in your downline through spillover.
              They help grow your team structure, but referral bonuses go to 
              their original referrers.
            </p>
          </div>
          <div className="team-grid">
            {spilloverMembers.map(member => (
              <MemberCard key={member.id} member={member} isSpillover />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MemberCard({ member, isSpillover }) {
  return (
    <div className={`member-card ${isSpillover ? 'spillover' : ''}`}>
      <div className="member-header">
        <div className="member-avatar">
          {member.full_name.charAt(0)}
        </div>
        <div className="member-info">
          <h3>{member.full_name}</h3>
          <p className="member-email">{member.email}</p>
        </div>
        {isSpillover && (
          <span className="badge badge-info">Spillover</span>
        )}
      </div>
      
      <div className="member-details">
        <div className="detail-row">
          <span className="label">Level:</span>
          <span className="value">{member.mlm_level}</span>
        </div>
        
        {isSpillover ? (
          <>
            <div className="detail-row spillover-info">
              <span className="label">Referred by:</span>
              <span className="value">{member.original_referrer_name}</span>
            </div>
            <div className="detail-row">
              <span className="label">Earning:</span>
              <span className="value text-muted">
                N/A
                <i 
                  className="icon-info-circle" 
                  title={`Bonus goes to ${member.original_referrer_name}`}
                ></i>
              </span>
            </div>
          </>
        ) : (
          <div className="detail-row">
            <span className="label">Earned:</span>
            <span className="value text-success">
              ${member.earning_from_user.toFixed(2)}
            </span>
          </div>
        )}
        
        <div className="detail-row">
          <span className="label">Status:</span>
          <span className={`badge ${member.has_deposited ? 'badge-success' : 'badge-warning'}`}>
            {member.has_deposited ? 'Active' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
```

## Testing Checklist

- [ ] Spillover members display with "Spillover" badge
- [ ] Original referrer name shows for spillover members
- [ ] Earning shows as "N/A" for spillover members
- [ ] Tooltip explains why earning is N/A
- [ ] Direct and spillover sections are visually distinct
- [ ] Statistics count both types correctly
- [ ] Notifications display spillover information
- [ ] Mobile responsive design works
- [ ] Color scheme matches brand
- [ ] Icons are consistent

## API Service Example

```javascript
// src/services/api.js
export const apiService = {
  async getTeam() {
    const response = await fetch('/api/mlm/team', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.json();
  }
};
```

## Questions?

Contact the backend team or refer to:
- `SPILLOVER_SYSTEM.md` - Complete system documentation
- `SPILLOVER_IMPLEMENTATION_SUMMARY.md` - Implementation details
