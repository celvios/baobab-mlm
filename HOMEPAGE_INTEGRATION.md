# Homepage Integration Guide

## Changes Made

### 1. Navigation Bar Update
- **File**: `home/nav.php`
- **Changes**:
  - Added "Login" button that links to `/login` (React login page)
  - Updated all navigation links to use absolute paths (`/`, `/aboutus`, `/product`, `/contact`)
  - Login button styled with `btn-primary` class

### 2. Root Routing Configuration
- **File**: `.htaccess` (root)
- **Purpose**: Routes traffic between PHP homepage and React app
- **Routing Rules**:
  - `/` → serves `home/index.php`
  - `/aboutus`, `/contact`, `/product`, `/details` → serves respective PHP files from `home/`
  - Static assets (`/css`, `/js`, `/img`, etc.) → served from `home/` folder
  - All other routes → served by React app (`index.html`)

### 3. Fallback Redirect
- **File**: `index.php` (root)
- **Purpose**: Redirects root access to home folder if .htaccess doesn't work

## How It Works

1. **Homepage**: When users visit `https://baobabworldwide.com/`, they see the PHP marketing site from the `home/` folder
2. **Login**: Clicking "Login" button navigates to `/login`, which loads the React app's login page
3. **Marketing Pages**: About Us, Products, Contact pages continue to work as PHP pages
4. **User Dashboard**: After login, users access `/user/dashboard` (React app)
5. **Admin Panel**: Admins access `/admin/login` (React app)

## Deployment Steps

### For Apache Server (cPanel/Shared Hosting):
1. Upload all files to public_html or root directory
2. Ensure `.htaccess` file is in the root
3. Ensure `mod_rewrite` is enabled on server
4. Test the homepage at root URL

### For Node.js/Express Server:
Add this middleware to your Express server:

```javascript
// Serve home folder for marketing pages
app.use('/home', express.static(path.join(__dirname, 'home')));

// Root route serves home/index.php
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home', 'index.php'));
});

// Marketing page routes
app.get(['/aboutus', '/contact', '/product', '/details'], (req, res) => {
  const page = req.path.substring(1);
  res.sendFile(path.join(__dirname, 'home', `${page}.php`));
});

// All other routes serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
```

## Testing

1. **Homepage**: Visit `https://baobabworldwide.com/` - should show marketing site
2. **Login Button**: Click "Login" in navbar - should navigate to React login page
3. **Navigation**: Test all navbar links (Home, About Us, Products, Contact)
4. **Direct Login**: Visit `https://baobabworldwide.com/login` - should show React login
5. **After Login**: Should redirect to `/user/dashboard`

## File Structure
```
baobab-mlm-fresh/
├── .htaccess (NEW - root routing)
├── index.php (NEW - fallback redirect)
├── home/
│   ├── nav.php (UPDATED - added Login button)
│   ├── index.php (homepage)
│   ├── aboutus.php
│   ├── contact.php
│   ├── product.php
│   └── ... (other PHP files)
├── src/ (React app)
├── backend/ (Node.js API)
└── build/ (React build output)
```

## Notes
- The PHP homepage and React app are now seamlessly integrated
- Users can navigate between marketing pages and the login system
- All existing functionality remains intact
- The system maintains separate routing for PHP and React pages
