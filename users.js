const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (Admin and Supervisor can see all)
// @access  Private (Admin, Supervisor)
router.get('/', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, full_name, role, phone, is_active, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: {
        users: result.rows.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          phone: user.phone,
          isActive: user.is_active,
          createdAt: user.created_at,
          lastLogin: user.last_login
        }))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// @route   POST /api/users
// @desc    Create new user (Admin only)
// @access  Private (Admin)
router.post('/', [
  authenticateToken,
  authorizeRoles('admin'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'supervisor', 'employee']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, fullName, password, role, phone } = req.body;

    // Check if email already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, full_name, password_hash, role, phone) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, role, phone, is_active, created_at`,
      [email.toLowerCase(), fullName, hashedPassword, role, phone || null]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          phone: user.phone,
          isActive: user.is_active,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create user' 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  authorizeRoles('admin'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
  body('role').optional().isIn(['admin', 'supervisor', 'employee']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { email, fullName, role, phone, isActive } = req.body;

    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // If email is being updated, check if it's already taken
    if (email) {
      const emailCheck = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email.toLowerCase());
      paramCount++;
    }
    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount}`);
      values.push(fullName);
      paramCount++;
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(isActive);
      paramCount++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, email, full_name, role, phone, is_active`,
      values
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          phone: user.phone,
          isActive: user.is_active
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user' 
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }

    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user' 
    });
  }
});

// @route   POST /api/users/:id/reset-password
// @desc    Reset user password (Admin only)
// @access  Private (Admin)
router.post('/:id/reset-password', [
  authenticateToken,
  authorizeRoles('admin'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
});

module.exports = router;
