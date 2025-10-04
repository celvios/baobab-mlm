const createEmailTemplate = (subject, message, recipientName = 'Valued Member') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: #4a5d23; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #4a5d23; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .highlight { background: #f8f9fa; padding: 15px; border-left: 4px solid #4a5d23; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">🌳 Baobab MLM</h1>
                <p style="margin: 5px 0 0 0;">Growing Together, Earning Together</p>
            </div>
            <div class="content">
                <h2 style="color: #4a5d23;">${subject}</h2>
                <p>Dear ${recipientName},</p>
                <div style="margin: 20px 0;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                <div class="highlight">
                    <strong>Need Help?</strong><br>
                    Contact our support team or visit your dashboard for more information.
                </div>
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
                        Visit Dashboard
                    </a>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent from Baobab MLM Admin Panel.</p>
                <p>© ${new Date().getFullYear()} Baobab MLM. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const createWelcomeTemplate = (fullName, referralCode) => {
  return createEmailTemplate(
    'Welcome to Baobab MLM!',
    `
    Welcome to the Baobab community! We're excited to have you on board.
    
    <div class="highlight">
        <strong>Your Referral Code: ${referralCode}</strong><br>
        Share this code with friends and family to start earning referral bonuses!
    </div>
    
    <h3>Next Steps:</h3>
    <ol>
        <li>Complete your profile with bank details</li>
        <li>Purchase products to qualify for MLM stages</li>
        <li>Start referring others to build your team</li>
        <li>Watch your earnings grow!</li>
    </ol>
    
    Ready to start your journey with us?
    `,
    fullName
  );
};

const createAnnouncementTemplate = (title, announcement) => {
  return createEmailTemplate(
    `📢 ${title}`,
    `
    We have an important announcement for all Baobab community members:
    
    <div class="highlight">
        ${announcement}
    </div>
    
    Stay connected with us for more updates and opportunities!
    `
  );
};

const createPromotionTemplate = (title, promotion, ctaText = 'Learn More', ctaLink = '') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: linear-gradient(135deg, #4a5d23, #6b7c2e); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; }
            .cta-button { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0;">🎉 ${title}</h1>
            </div>
            <div class="content">
                <div style="margin: 20px 0; font-size: 16px;">
                    ${promotion.replace(/\n/g, '<br>')}
                </div>
                <div style="text-align: center;">
                    <a href="${ctaLink || process.env.FRONTEND_URL + '/dashboard'}" class="cta-button">
                        ${ctaText}
                    </a>
                </div>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Baobab MLM. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  createEmailTemplate,
  createWelcomeTemplate,
  createAnnouncementTemplate,
  createPromotionTemplate
};