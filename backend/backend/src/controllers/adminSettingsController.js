const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const result = await pool.query(
      'UPDATE admins SET name = $1, email = $2, phone = $3, role = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, name, email, phone, role',
      [name, email, phone, role, req.admin.id]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_profile', 'Updated admin profile']
    );

    res.json({ admin: result.rows[0] });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateBusinessDetails = async (req, res) => {
  try {
    const { name, email, phone, address, description } = req.body;

    const result = await pool.query(
      'INSERT INTO business_settings (name, email, phone, address, description, updated_by) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name = $1, email = $2, phone = $3, address = $4, description = $5, updated_by = $6, updated_at = CURRENT_TIMESTAMP RETURNING *',
      [name, email, phone, address, description, req.admin.id]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_business_details', 'Updated business details']
    );

    res.json({ business: result.rows[0] });
  } catch (error) {
    console.error('Update business details error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateAccountDetails = async (req, res) => {
  try {
    const { bank_name, account_number, account_name } = req.body;

    const result = await pool.query(
      'INSERT INTO bank_settings (bank_name, account_number, account_name, updated_by) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET bank_name = $1, account_number = $2, account_name = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP RETURNING *',
      [bank_name, account_number, account_name, req.admin.id]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_account_details', 'Updated bank account details']
    );

    res.json({ account: result.rows[0] });
  } catch (error) {
    console.error('Update account details error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getPickupStations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pickup_stations ORDER BY created_at DESC');
    res.json({ stations: result.rows });
  } catch (error) {
    console.error('Get pickup stations error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const createPickupStation = async (req, res) => {
  try {
    const { name, address, phone, is_active = true } = req.body;

    const result = await pool.query(
      'INSERT INTO pickup_stations (name, address, phone, is_active, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, address, phone, is_active, req.admin.id]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'create_pickup_station', `Created pickup station: ${name}`]
    );

    res.status(201).json({ station: result.rows[0] });
  } catch (error) {
    console.error('Create pickup station error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updatePickupStation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, is_active } = req.body;

    const result = await pool.query(
      'UPDATE pickup_stations SET name = $1, address = $2, phone = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, address, phone, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pickup station not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'update_pickup_station', `Updated pickup station: ${name}`]
    );

    res.json({ station: result.rows[0] });
  } catch (error) {
    console.error('Update pickup station error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const deletePickupStation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM pickup_stations WHERE id = $1 RETURNING name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pickup station not found' });
    }

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'delete_pickup_station', `Deleted pickup station: ${result.rows[0].name}`]
    );

    res.json({ message: 'Pickup station deleted successfully' });
  } catch (error) {
    console.error('Delete pickup station error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    // Verify old password
    const admin = await pool.query('SELECT password FROM admins WHERE id = $1', [req.admin.id]);
    const isMatch = await bcrypt.compare(old_password, admin.rows[0].password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      'UPDATE admins SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.admin.id]
    );

    // Log admin activity
    await pool.query(
      'INSERT INTO admin_activity_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.admin.id, 'change_password', 'Changed admin password']
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { updateAdminProfile, updateBusinessDetails, updateAccountDetails, getPickupStations, createPickupStation, updatePickupStation, deletePickupStation, changePassword };