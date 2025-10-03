import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { pool } from '../database/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register new user (admin only)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').isIn(['admin', 'agent', 'assistant'])
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, organizationId, phone } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [organizationId, email, passwordHash, firstName, lastName, role, phone]
    );

    const user = result.rows[0];
    
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      `SELECT u.*, o.name as organization_name, o.industry, o.gdpr_enabled, o.hipaa_enabled
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = $1 AND u.is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const payload = { userId: user.id, organizationId: user.organization_id };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        organizationId: user.organization_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        organization: {
          name: user.organization_name,
          industry: user.industry,
          gdprEnabled: user.gdpr_enabled,
          hipaaEnabled: user.hipaa_enabled
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: express.Response) => {
  try {
    const result = await pool.query(
      `SELECT u.*, o.name as organization_name, o.industry, o.gdpr_enabled, o.hipaa_enabled
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [req.user!.id]
    );

    const user = result.rows[0];
    
    return res.json({
      id: user.id,
      organizationId: user.organization_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      lastLogin: user.last_login,
      settings: user.settings,
      organization: {
        name: user.organization_name,
        industry: user.industry,
        gdprEnabled: user.gdpr_enabled,
        hipaaEnabled: user.hipaa_enabled
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().trim()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, settings } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           settings = COALESCE($4, settings),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, first_name, last_name, phone, settings, updated_at`,
      [firstName, lastName, phone, settings, req.user!.id]
    );

    return res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;