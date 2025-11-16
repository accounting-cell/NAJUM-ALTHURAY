const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get transactions (based on role)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, serviceType, assignedTo, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, 
             u.full_name as assigned_employee_name,
             c.full_name as created_by_name
      FROM transactions t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employees can only see their own transactions
      query += ` AND t.assigned_to = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }

    // Status filter
    if (status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Service type filter
    if (serviceType) {
      query += ` AND t.service_type ILIKE $${paramCount}`;
      params.push(`%${serviceType}%`);
      paramCount++;
    }

    // Assigned to filter (Admin and Supervisor only)
    if (assignedTo && (req.user.role === 'admin' || req.user.role === 'supervisor')) {
      query += ` AND t.assigned_to = $${paramCount}`;
      params.push(assignedTo);
      paramCount++;
    }

    // Search functionality
    if (search) {
      if (req.user.role === 'employee') {
        // Employees can only search by client name and mobile
        query += ` AND (t.client_name ILIKE $${paramCount} OR t.mobile_number ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      } else {
        // Admin and Supervisor can search all fields
        query += ` AND (
          t.transaction_number ILIKE $${paramCount} OR
          t.client_name ILIKE $${paramCount} OR
          t.mobile_number ILIKE $${paramCount} OR
          t.passport_id ILIKE $${paramCount} OR
          t.service_type ILIKE $${paramCount} OR
          t.notes ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }
    }

    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM').split('ORDER BY')[0];
    const countResult = await db.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        transactions: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transactions' 
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT t.*, 
              u.full_name as assigned_employee_name,
              c.full_name as created_by_name
       FROM transactions t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const transaction = result.rows[0];

    // Employees can only view their own transactions
    if (req.user.role === 'employee' && transaction.assigned_to !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Get modification history
    const historyResult = await db.query(
      `SELECT h.*, u.full_name as modified_by_name
       FROM transaction_history h
       LEFT JOIN users u ON h.modified_by = u.id
       WHERE h.transaction_id = $1
       ORDER BY h.modified_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        transaction,
        history: historyResult.rows
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transaction' 
    });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post('/', [
  authenticateToken,
  body('serviceType').notEmpty().withMessage('Service type is required'),
  body('transactionType').notEmpty().withMessage('Transaction type is required'),
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('passportId').notEmpty().withMessage('Passport/ID is required'),
  body('mobileNumber').notEmpty().withMessage('Mobile number is required'),
  body('receiveDate').notEmpty().withMessage('Receive date is required'),
  body('expectedDelivery').notEmpty().withMessage('Expected delivery date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      serviceType,
      transactionType,
      clientName,
      passportId,
      mobileNumber,
      status = 'pending',
      receiveDate,
      expectedDelivery,
      notes
    } = req.body;

    // Generate transaction number (format: TRX-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    
    const countResult = await db.query(
      `SELECT COUNT(*) FROM transactions WHERE transaction_number LIKE $1`,
      [`TRX-${dateStr}-%`]
    );
    
    const count = parseInt(countResult.rows[0].count) + 1;
    const transactionNumber = `TRX-${dateStr}-${count.toString().padStart(4, '0')}`;

    // Create transaction
    const result = await db.query(
      `INSERT INTO transactions (
        transaction_number, service_type, transaction_type, client_name, 
        passport_id, mobile_number, status, receive_date, expected_delivery, 
        notes, assigned_to, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        transactionNumber, serviceType, transactionType, clientName,
        passportId, mobileNumber, status, receiveDate, expectedDelivery,
        notes || null, req.user.id, req.user.id
      ]
    );

    const transaction = result.rows[0];

    // Log creation in history
    await db.query(
      `INSERT INTO transaction_history (
        transaction_id, action, changes, modified_by
      ) VALUES ($1, $2, $3, $4)`,
      [
        transaction.id,
        'created',
        JSON.stringify({ message: 'Transaction created' }),
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create transaction' 
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists
    const transactionCheck = await db.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );

    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const existingTransaction = transactionCheck.rows[0];

    // Employees can only update their own transactions
    if (req.user.role === 'employee' && existingTransaction.assigned_to !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    const {
      serviceType,
      transactionType,
      clientName,
      passportId,
      mobileNumber,
      status,
      receiveDate,
      expectedDelivery,
      notes
    } = req.body;

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    const changes = {};

    if (serviceType !== undefined && serviceType !== existingTransaction.service_type) {
      updates.push(`service_type = $${paramCount}`);
      values.push(serviceType);
      changes.service_type = { from: existingTransaction.service_type, to: serviceType };
      paramCount++;
    }
    if (transactionType !== undefined && transactionType !== existingTransaction.transaction_type) {
      updates.push(`transaction_type = $${paramCount}`);
      values.push(transactionType);
      changes.transaction_type = { from: existingTransaction.transaction_type, to: transactionType };
      paramCount++;
    }
    if (clientName !== undefined && clientName !== existingTransaction.client_name) {
      updates.push(`client_name = $${paramCount}`);
      values.push(clientName);
      changes.client_name = { from: existingTransaction.client_name, to: clientName };
      paramCount++;
    }
    if (passportId !== undefined && passportId !== existingTransaction.passport_id) {
      updates.push(`passport_id = $${paramCount}`);
      values.push(passportId);
      changes.passport_id = { from: existingTransaction.passport_id, to: passportId };
      paramCount++;
    }
    if (mobileNumber !== undefined && mobileNumber !== existingTransaction.mobile_number) {
      updates.push(`mobile_number = $${paramCount}`);
      values.push(mobileNumber);
      changes.mobile_number = { from: existingTransaction.mobile_number, to: mobileNumber };
      paramCount++;
    }
    if (status !== undefined && status !== existingTransaction.status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      changes.status = { from: existingTransaction.status, to: status };
      paramCount++;
    }
    if (receiveDate !== undefined && receiveDate !== existingTransaction.receive_date) {
      updates.push(`receive_date = $${paramCount}`);
      values.push(receiveDate);
      changes.receive_date = { from: existingTransaction.receive_date, to: receiveDate };
      paramCount++;
    }
    if (expectedDelivery !== undefined && expectedDelivery !== existingTransaction.expected_delivery) {
      updates.push(`expected_delivery = $${paramCount}`);
      values.push(expectedDelivery);
      changes.expected_delivery = { from: existingTransaction.expected_delivery, to: expectedDelivery };
      paramCount++;
    }
    if (notes !== undefined && notes !== existingTransaction.notes) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes);
      changes.notes = { from: existingTransaction.notes, to: notes };
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No changes detected' 
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await db.query(
      `UPDATE transactions SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    // Log changes in history
    await db.query(
      `INSERT INTO transaction_history (
        transaction_id, action, changes, modified_by
      ) VALUES ($1, $2, $3, $4)`,
      [id, 'updated', JSON.stringify(changes), req.user.id]
    );

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction: result.rows[0] }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update transaction' 
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const transactionCheck = await db.query(
      'SELECT id FROM transactions WHERE id = $1',
      [id]
    );

    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Delete transaction (cascade will delete history)
    await db.query('DELETE FROM transactions WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete transaction' 
    });
  }
});

// @route   GET /api/transactions/stats/summary
// @desc    Get transaction statistics
// @access  Private (Admin, Supervisor)
router.get('/stats/summary', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'ready') as ready,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today
      FROM transactions
    `;

    const result = await db.query(statsQuery);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics' 
    });
  }
});

module.exports = router;
