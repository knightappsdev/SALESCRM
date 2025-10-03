import express, { Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { pool } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all deals for organization
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT d.*, c.first_name as contact_first_name, c.last_name as contact_last_name,
              u.first_name as assigned_first_name, u.last_name as assigned_last_name
       FROM deals d
       LEFT JOIN contacts c ON d.contact_id = c.id
       LEFT JOIN users u ON d.assigned_to = u.id
       WHERE d.organization_id = $1
       ORDER BY d.created_at DESC`,
      [req.user!.organizationId]
    );

    res.json({
      deals: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        value: parseFloat(row.value || 0),
        currency: row.currency,
        stage: row.stage,
        probability: row.probability,
        expectedCloseDate: row.expected_close_date,
        actualCloseDate: row.actual_close_date,
        isWon: row.is_won,
        contact: row.contact_id ? {
          id: row.contact_id,
          name: `${row.contact_first_name} ${row.contact_last_name}`
        } : null,
        assignedTo: row.assigned_to ? {
          id: row.assigned_to,
          name: `${row.assigned_first_name} ${row.assigned_last_name}`
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new deal
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('value').optional().isNumeric(),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('stage').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  body('expectedCloseDate').optional().isISO8601(),
  body('contactId').optional().isUUID(),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      value,
      currency = 'USD',
      stage = 'new',
      probability = 0,
      expectedCloseDate,
      contactId,
      assignedTo
    } = req.body;

    const result = await pool.query(
      `INSERT INTO deals (
        organization_id, contact_id, assigned_to, title, description, value,
        currency, stage, probability, expected_close_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        req.user!.organizationId,
        contactId,
        assignedTo || req.user!.id,
        title,
        description,
        value,
        currency,
        stage,
        probability,
        expectedCloseDate
      ]
    );

    const deal = result.rows[0];
    res.status(201).json({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      value: parseFloat(deal.value || 0),
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expected_close_date,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;