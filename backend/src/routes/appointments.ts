import express, { Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { pool } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all appointments for organization
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.*, c.first_name as contact_first_name, c.last_name as contact_last_name,
              u.first_name as assigned_first_name, u.last_name as assigned_last_name
       FROM appointments a
       LEFT JOIN contacts c ON a.contact_id = c.id
       LEFT JOIN users u ON a.assigned_to = u.id
       WHERE a.organization_id = $1
       ORDER BY a.start_time ASC`,
      [req.user!.organizationId]
    );

    res.json({
      appointments: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        startTime: row.start_time,
        endTime: row.end_time,
        location: row.location,
        meetingLink: row.meeting_link,
        status: row.status,
        reminderSent: row.reminder_sent,
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
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new appointment
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('location').optional().trim(),
  body('meetingLink').optional().isURL(),
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
      startTime,
      endTime,
      location,
      meetingLink,
      contactId,
      assignedTo
    } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments (
        organization_id, contact_id, assigned_to, title, description,
        start_time, end_time, location, meeting_link
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.user!.organizationId,
        contactId,
        assignedTo || req.user!.id,
        title,
        description,
        startTime,
        endTime,
        location,
        meetingLink
      ]
    );

    const appointment = result.rows[0];
    res.status(201).json({
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      location: appointment.location,
      meetingLink: appointment.meeting_link,
      status: appointment.status,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;