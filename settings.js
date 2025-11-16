const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    Get system settings
// @access  Public (needed for login page branding)
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM settings WHERE id = 1');
    
    if (result.rows.length === 0) {
      // Return default settings if none exist
      return res.json({
        success: true,
        data: {
          settings: {
            appName: 'Najm Althuraya',
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            defaultLanguage: 'ar'
          }
        }
      });
    }

    const settings = result.rows[0];

    res.json({
      success: true,
      data: {
        settings: {
          appName: settings.app_name,
          primaryColor: settings.primary_color,
          secondaryColor: settings.secondary_color,
          defaultLanguage: settings.default_language
        }
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch settings' 
    });
  }
});

// @route   PUT /api/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/', [
  authenticateToken,
  authorizeRoles('admin'),
  body('appName').optional().notEmpty().withMessage('App name cannot be empty'),
  body('primaryColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('secondaryColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('defaultLanguage').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { appName, primaryColor, secondaryColor, defaultLanguage } = req.body;

    // Check if settings exist
    const existingSettings = await db.query('SELECT id FROM settings WHERE id = 1');

    let result;
    if (existingSettings.rows.length === 0) {
      // Create settings
      result = await db.query(
        `INSERT INTO settings (id, app_name, primary_color, secondary_color, default_language)
         VALUES (1, $1, $2, $3, $4)
         RETURNING *`,
        [
          appName || 'Najm Althuraya',
          primaryColor || '#3b82f6',
          secondaryColor || '#8b5cf6',
          defaultLanguage || 'ar'
        ]
      );
    } else {
      // Update settings
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (appName !== undefined) {
        updates.push(`app_name = $${paramCount}`);
        values.push(appName);
        paramCount++;
      }
      if (primaryColor !== undefined) {
        updates.push(`primary_color = $${paramCount}`);
        values.push(primaryColor);
        paramCount++;
      }
      if (secondaryColor !== undefined) {
        updates.push(`secondary_color = $${paramCount}`);
        values.push(secondaryColor);
        paramCount++;
      }
      if (defaultLanguage !== undefined) {
        updates.push(`default_language = $${paramCount}`);
        values.push(defaultLanguage);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No changes detected' 
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      result = await db.query(
        `UPDATE settings SET ${updates.join(', ')} WHERE id = 1 RETURNING *`,
        values
      );
    }

    const settings = result.rows[0];

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: {
          appName: settings.app_name,
          primaryColor: settings.primary_color,
          secondaryColor: settings.secondary_color,
          defaultLanguage: settings.default_language
        }
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update settings' 
    });
  }
});

// @route   GET /api/settings/status-options
// @desc    Get available status options
// @access  Private
router.get('/status-options', authenticateToken, async (req, res) => {
  try {
    const statusOptions = [
      { value: 'pending', label: { en: 'Pending', ar: 'معلق' } },
      { value: 'in_progress', label: { en: 'In Progress', ar: 'قيد التنفيذ' } },
      { value: 'ready', label: { en: 'Ready for Delivery', ar: 'جاهز للتسليم' } },
      { value: 'delivered', label: { en: 'Delivered', ar: 'تم التسليم' } },
      { value: 'cancelled', label: { en: 'Cancelled', ar: 'ملغي' } }
    ];

    res.json({
      success: true,
      data: { statusOptions }
    });
  } catch (error) {
    console.error('Get status options error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch status options' 
    });
  }
});

// @route   GET /api/settings/transaction-types
// @desc    Get available transaction types
// @access  Private
router.get('/transaction-types', authenticateToken, async (req, res) => {
  try {
    const transactionTypes = [
      { value: 'new', label: { en: 'New', ar: 'جديد' } },
      { value: 'renewal', label: { en: 'Renewal', ar: 'تجديد' } },
      { value: 'update', label: { en: 'Update', ar: 'تحديث' } },
      { value: 'cancellation', label: { en: 'Cancellation', ar: 'إلغاء' } }
    ];

    res.json({
      success: true,
      data: { transactionTypes }
    });
  } catch (error) {
    console.error('Get transaction types error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transaction types' 
    });
  }
});

module.exports = router;
