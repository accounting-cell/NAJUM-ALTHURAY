const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/handovers
// @desc    Get all handovers (Supervisor and Admin)
// @access  Private (Supervisor, Admin)
router.get('/', authenticateToken, authorizeRoles('supervisor', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT h.*,
              u1.full_name as from_employee_name,
              u2.full_name as to_employee_name,
              u3.full_name as supervisor_name
       FROM handovers h
       LEFT JOIN users u1 ON h.from_employee = u1.id
       LEFT JOIN users u2 ON h.to_employee = u2.id
       LEFT JOIN users u3 ON h.supervisor_id = u3.id
       ORDER BY h.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM handovers');
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        handovers: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get handovers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch handovers' 
    });
  }
});

// @route   POST /api/handovers
// @desc    Create new handover (Supervisor only)
// @access  Private (Supervisor)
router.post('/', [
  authenticateToken,
  authorizeRoles('supervisor'),
  body('fromEmployee').isInt().withMessage('From employee ID is required'),
  body('toEmployee').isInt().withMessage('To employee ID is required'),
  body('transactionIds').isArray().withMessage('Transaction IDs must be an array'),
  body('transactionIds').notEmpty().withMessage('At least one transaction must be selected')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { fromEmployee, toEmployee, transactionIds, notes } = req.body;

    // Validate employees exist
    const employeeCheck = await db.query(
      'SELECT id, role FROM users WHERE id = ANY($1)',
      [[fromEmployee, toEmployee]]
    );

    if (employeeCheck.rows.length !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'One or both employees not found' 
      });
    }

    // Ensure both are employees (not admin/supervisor)
    const invalidRoles = employeeCheck.rows.filter(u => u.role !== 'employee');
    if (invalidRoles.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Handover can only be done between employees' 
      });
    }

    // Validate transactions exist and belong to fromEmployee
    const transactionCheck = await db.query(
      `SELECT id, assigned_to FROM transactions 
       WHERE id = ANY($1) AND assigned_to = $2`,
      [transactionIds, fromEmployee]
    );

    if (transactionCheck.rows.length !== transactionIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some transactions are invalid or not assigned to the from employee' 
      });
    }

    // Start transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create handover record
      const handoverResult = await client.query(
        `INSERT INTO handovers (
          from_employee, to_employee, notes, supervisor_id, status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [fromEmployee, toEmployee, notes || null, req.user.id, 'pending']
      );

      const handover = handoverResult.rows[0];

      // Create handover items
      for (const transactionId of transactionIds) {
        await client.query(
          `INSERT INTO handover_items (handover_id, transaction_id)
           VALUES ($1, $2)`,
          [handover.id, transactionId]
        );
      }

      // Update transactions to new employee
      await client.query(
        `UPDATE transactions 
         SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = ANY($2)`,
        [toEmployee, transactionIds]
      );

      // Log in transaction history
      for (const transactionId of transactionIds) {
        await client.query(
          `INSERT INTO transaction_history (
            transaction_id, action, changes, modified_by
          ) VALUES ($1, $2, $3, $4)`,
          [
            transactionId,
            'handover',
            JSON.stringify({
              from: fromEmployee,
              to: toEmployee,
              handover_id: handover.id
            }),
            req.user.id
          ]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Handover created successfully',
        data: { handover }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create handover error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create handover' 
    });
  }
});

// @route   GET /api/handovers/:id
// @desc    Get handover details with transactions
// @access  Private (Supervisor, Admin)
router.get('/:id', authenticateToken, authorizeRoles('supervisor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get handover details
    const handoverResult = await db.query(
      `SELECT h.*,
              u1.full_name as from_employee_name,
              u2.full_name as to_employee_name,
              u3.full_name as supervisor_name
       FROM handovers h
       LEFT JOIN users u1 ON h.from_employee = u1.id
       LEFT JOIN users u2 ON h.to_employee = u2.id
       LEFT JOIN users u3 ON h.supervisor_id = u3.id
       WHERE h.id = $1`,
      [id]
    );

    if (handoverResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Handover not found' 
      });
    }

    // Get handover items (transactions)
    const itemsResult = await db.query(
      `SELECT hi.*, t.transaction_number, t.client_name, t.service_type, t.status
       FROM handover_items hi
       JOIN transactions t ON hi.transaction_id = t.id
       WHERE hi.handover_id = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        handover: handoverResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Get handover error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch handover details' 
    });
  }
});

// @route   PUT /api/handovers/:id/accept
// @desc    Accept handover (Employee receiving)
// @access  Private (Employee)
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get handover
    const handoverResult = await db.query(
      'SELECT * FROM handovers WHERE id = $1',
      [id]
    );

    if (handoverResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Handover not found' 
      });
    }

    const handover = handoverResult.rows[0];

    // Verify the user is the to_employee
    if (handover.to_employee !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. This handover is not assigned to you.' 
      });
    }

    // Update handover status
    await db.query(
      `UPDATE handovers 
       SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Handover accepted successfully'
    });
  } catch (error) {
    console.error('Accept handover error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept handover' 
    });
  }
});

// @route   GET /api/handovers/my/pending
// @desc    Get pending handovers for current user
// @access  Private (Employee)
router.get('/my/pending', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT h.*,
              u1.full_name as from_employee_name,
              u3.full_name as supervisor_name,
              COUNT(hi.id) as transaction_count
       FROM handovers h
       LEFT JOIN users u1 ON h.from_employee = u1.id
       LEFT JOIN users u3 ON h.supervisor_id = u3.id
       LEFT JOIN handover_items hi ON h.id = hi.handover_id
       WHERE h.to_employee = $1 AND h.status = 'pending'
       GROUP BY h.id, u1.full_name, u3.full_name
       ORDER BY h.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { handovers: result.rows }
    });
  } catch (error) {
    console.error('Get pending handovers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending handovers' 
    });
  }
});

module.exports = router;
