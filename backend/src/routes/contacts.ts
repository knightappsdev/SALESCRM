import express, { Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { pool } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all contacts for organization
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('status').optional().isIn(['lead', 'prospect', 'client', 'inactive']),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name
      FROM contacts c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.organization_id = $1
    `;
    const params: any[] = [req.user!.organizationId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM contacts WHERE organization_id = $1`;
    const countParams: any[] = [req.user!.organizationId];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND (first_name ILIKE $${countParamIndex} OR last_name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      contacts: result.rows.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        status: row.status,
        source: row.source,
        tags: row.tags,
        notes: row.notes,
        customFields: row.custom_fields,
        gdprConsent: row.gdpr_consent,
        gdprConsentDate: row.gdpr_consent_date,
        assignedTo: row.assigned_to ? {
          id: row.assigned_to,
          name: `${row.assigned_first_name} ${row.assigned_last_name}`
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new contact
router.post('/', authenticateToken, [
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('status').optional().isIn(['lead', 'prospect', 'client', 'inactive']),
  body('source').optional().trim(),
  body('tags').optional().isArray(),
  body('notes').optional().trim(),
  body('customFields').optional().isObject(),
  body('gdprConsent').optional().isBoolean(),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      status = 'lead',
      source,
      tags = [],
      notes,
      customFields = {},
      gdprConsent = false,
      assignedTo
    } = req.body;

    // Check if email already exists in organization
    if (email) {
      const existingContact = await pool.query(
        'SELECT id FROM contacts WHERE email = $1 AND organization_id = $2',
        [email, req.user!.organizationId]
      );
      if (existingContact.rows.length > 0) {
        return res.status(400).json({ error: 'Contact with this email already exists' });
      }
    }

    const result = await pool.query(
      `INSERT INTO contacts (
        organization_id, assigned_to, first_name, last_name, email, phone, address,
        status, source, tags, notes, custom_fields, gdpr_consent, gdpr_consent_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        req.user!.organizationId,
        assignedTo || req.user!.id,
        firstName,
        lastName,
        email,
        phone,
        address,
        status,
        source,
        tags,
        notes,
        customFields,
        gdprConsent,
        gdprConsent ? new Date() : null
      ]
    );

    const contact = result.rows[0];
    res.status(201).json({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      status: contact.status,
      source: contact.source,
      tags: contact.tags,
      notes: contact.notes,
      customFields: contact.custom_fields,
      gdprConsent: contact.gdpr_consent,
      gdprConsentDate: contact.gdpr_consent_date,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single contact
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.first_name as assigned_first_name, u.last_name as assigned_last_name
       FROM contacts c
       LEFT JOIN users u ON c.assigned_to = u.id
       WHERE c.id = $1 AND c.organization_id = $2`,
      [req.params.id, req.user!.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = result.rows[0];
    res.json({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      status: contact.status,
      source: contact.source,
      tags: contact.tags,
      notes: contact.notes,
      customFields: contact.custom_fields,
      gdprConsent: contact.gdpr_consent,
      gdprConsentDate: contact.gdpr_consent_date,
      assignedTo: contact.assigned_to ? {
        id: contact.assigned_to,
        name: `${contact.assigned_first_name} ${contact.assigned_last_name}`
      } : null,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('status').optional().isIn(['lead', 'prospect', 'client', 'inactive']),
  body('source').optional().trim(),
  body('tags').optional().isArray(),
  body('notes').optional().trim(),
  body('customFields').optional().isObject(),
  body('gdprConsent').optional().isBoolean(),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if contact exists and belongs to organization
    const existingContact = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND organization_id = $2',
      [req.params.id, req.user!.organizationId]
    );

    if (existingContact.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(req.body).forEach(([key, value]) => {
      if (value !== undefined) {
        switch (key) {
          case 'firstName':
            updates.push(`first_name = $${paramIndex}`);
            values.push(value);
            paramIndex++;
            break;
          case 'lastName':
            updates.push(`last_name = $${paramIndex}`);
            values.push(value);
            paramIndex++;
            break;
          case 'customFields':
            updates.push(`custom_fields = $${paramIndex}`);
            values.push(value);
            paramIndex++;
            break;
          case 'gdprConsent':
            updates.push(`gdpr_consent = $${paramIndex}`);
            values.push(value);
            paramIndex++;
            if (value && !existingContact.rows[0].gdpr_consent) {
              updates.push(`gdpr_consent_date = $${paramIndex}`);
              values.push(new Date());
              paramIndex++;
            }
            break;
          default:
            if (['email', 'phone', 'address', 'status', 'source', 'tags', 'notes'].includes(key)) {
              updates.push(`${key} = $${paramIndex}`);
              values.push(value);
              paramIndex++;
            }
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id, req.user!.organizationId);

    const query = `
      UPDATE contacts 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND organization_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const contact = result.rows[0];

    res.json({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      status: contact.status,
      source: contact.source,
      tags: contact.tags,
      notes: contact.notes,
      customFields: contact.custom_fields,
      gdprConsent: contact.gdpr_consent,
      gdprConsentDate: contact.gdpr_consent_date,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND organization_id = $2 RETURNING id',
      [req.params.id, req.user!.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;