# Admin Exchange Rate Management Guide

## 📍 Where to Find It

**Admin Dashboard → Settings → Exchange Rate Tab**

## 🖥️ What You'll See

### Current Exchange Rate Display
```
┌─────────────────────────────────────────────┐
│  Current Exchange Rate                      │
│  ₦1,500 / $1                    Last Updated│
│                              Jan 15, 2024    │
└─────────────────────────────────────────────┘
```

### Update Form
```
┌─────────────────────────────────────────────┐
│  New Exchange Rate (NGN per 1 USD)          │
│  ┌─────────────────────────────────────┐    │
│  │ 1500                                │    │
│  └─────────────────────────────────────┘    │
│  This rate will be used throughout the      │
│  system for all currency conversions        │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │     Update Exchange Rate            │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Important Notes Section
```
⚠️ Important Notes:
• This rate replaces the external API exchange rate
• All prices displayed to users will use this rate
• Changes take effect immediately across the system
• Update this rate regularly to reflect current market conditions
```

## 📝 Step-by-Step Instructions

### Viewing Current Rate
1. Login to admin dashboard
2. Click **Settings** in the sidebar
3. Click **Exchange Rate** tab
4. See current rate displayed prominently

### Updating the Rate
1. In the "New Exchange Rate" field, enter your desired rate
   - Example: `1550` for ₦1,550 per $1
2. Click **Update Exchange Rate** button
3. Wait for success message
4. New rate is now active!

## 💡 Common Scenarios

### Scenario 1: Market Rate Changed
**Problem**: Dollar rate increased from ₦1,500 to ₦1,550

**Solution**:
1. Go to Exchange Rate tab
2. Enter `1550` in the field
3. Click Update
4. All product prices now reflect new rate

### Scenario 2: Promotional Rate
**Problem**: Want to offer better rate for customers

**Solution**:
1. Go to Exchange Rate tab
2. Enter lower rate (e.g., `1450`)
3. Click Update
4. Customers see better prices

### Scenario 3: Check Last Update
**Problem**: Need to know when rate was last changed

**Solution**:
1. Go to Exchange Rate tab
2. Look at "Last Updated" timestamp
3. See exact date and time

## 🎯 Best Practices

### ✅ DO
- Update rate regularly (weekly or as needed)
- Check market rates before updating
- Inform team before major rate changes
- Keep rate competitive
- Document rate changes

### ❌ DON'T
- Set unrealistic rates
- Change rate too frequently (confuses users)
- Forget to update when market changes significantly
- Set rate to 0 or negative values
- Make changes without checking current market

## 📊 Impact of Rate Changes

### When You Increase Rate (e.g., 1500 → 1600)
- ✅ Product prices increase in Naira
- ✅ Protects business from currency fluctuation
- ⚠️ May affect customer purchasing decisions

### When You Decrease Rate (e.g., 1500 → 1400)
- ✅ Product prices decrease in Naira
- ✅ More attractive to customers
- ⚠️ May reduce profit margins

## 🔍 Monitoring

### What Gets Updated
- ✅ All product prices
- ✅ Wallet balances display
- ✅ Transaction amounts
- ✅ Withdrawal calculations
- ✅ Commission displays

### What Stays the Same
- ✅ Historical transaction records
- ✅ Completed order amounts
- ✅ Past withdrawal amounts

## 🆘 Troubleshooting

### Rate Not Updating
**Problem**: Clicked update but rate didn't change

**Solutions**:
1. Check internet connection
2. Refresh the page
3. Try logging out and back in
4. Check browser console for errors

### Can't Access Exchange Rate Tab
**Problem**: Don't see Exchange Rate option

**Solutions**:
1. Verify you're logged in as admin
2. Check you're in Settings section
3. Scroll through all tabs
4. Clear browser cache

### Error Message Appears
**Problem**: "Failed to update exchange rate"

**Solutions**:
1. Check the rate value is positive
2. Ensure rate is reasonable (e.g., 100-10000)
3. Try again in a few moments
4. Contact technical support

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Try the troubleshooting steps
3. Contact technical support with:
   - Screenshot of error
   - Rate you tried to set
   - Time of attempt

## 🎓 Training Checklist

For new admins, ensure they can:
- [ ] Find the Exchange Rate tab
- [ ] View current exchange rate
- [ ] Understand the last updated timestamp
- [ ] Enter a new rate value
- [ ] Click update button
- [ ] Verify success message
- [ ] Understand impact of rate changes
- [ ] Know when to update rates

## 📈 Recommended Update Schedule

### Daily
- Monitor market rates
- Note significant changes

### Weekly
- Review current rate vs market
- Update if difference > 2%

### Monthly
- Analyze rate change impact
- Review pricing strategy
- Document rate history

## 🎉 Quick Reference

| Action | Steps |
|--------|-------|
| View Rate | Settings → Exchange Rate |
| Update Rate | Enter value → Click Update |
| Check History | View "Last Updated" |
| Verify Change | Check product prices |

---

**Remember**: You have full control over the exchange rate. Use it wisely to balance business needs and customer satisfaction! 💪
