const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const XLSX = require('xlsx');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Common regex
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validators
const userValidationRules = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required').isLength({ min: 10, max: 10 }).isNumeric().withMessage('Phone number must be 10 digits'),
  body('panNumber').notEmpty().withMessage('PAN number is required').matches(panRegex).withMessage('Invalid PAN format (ABCDE1234F)')
];

// Reusable helper
const validatePAN = (pan) => panRegex.test(pan);

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.app.locals.pool.query('SELECT * FROM users ORDER BY createdAt DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await req.app.locals.pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
});

// POST create user
router.post('/', userValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { firstName, lastName, email, phoneNumber, panNumber } = req.body;
  try {
    const pool = req.app.locals.pool;
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ success: false, message: 'Email already exists' });

    const [result] = await pool.query(
      'INSERT INTO users (firstName, lastName, email, phoneNumber, panNumber) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, phoneNumber, panNumber]
    );

    res.status(201).json({ success: true, message: 'User created', data: { id: result.insertId, firstName, lastName, email, phoneNumber, panNumber } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
});

// PUT update user
router.put('/:id', userValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { firstName, lastName, email, phoneNumber, panNumber } = req.body;
  const userId = req.params.id;

  try {
    const pool = req.app.locals.pool;
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'User not found' });

    const [emailCheck] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (emailCheck.length) return res.status(400).json({ success: false, message: 'Email already exists for another user' });

    await pool.query(
      'UPDATE users SET firstName=?, lastName=?, email=?, phoneNumber=?, panNumber=? WHERE id=?',
      [firstName, lastName, email, phoneNumber, panNumber, userId]
    );

    res.json({ success: true, message: 'User updated', data: { id: userId, firstName, lastName, email, phoneNumber, panNumber } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const userId = req.params.id;
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'User not found' });

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

// GET sample Excel template
router.get('/download/sample', (req, res) => {
  try {
    const wb = XLSX.utils.book_new();
    const data = [['First Name', 'Last Name', 'Email', 'Phone Number', 'PAN Number'], ['John', 'Doe', 'john@example.com', '1234567890', 'ABCDE1234F']];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), 'Users');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=user_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate file', error: error.message });
  }
});

// POST bulk upload
router.post('/upload', upload.single('file'), async (req, res) => {
  const pool = req.app.locals.pool;
  const errors = [], validUsers = [];

  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const worksheet = XLSX.read(req.file.buffer, { type: 'buffer' }).Sheets[XLSX.read(req.file.buffer, { type: 'buffer' }).SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data.length) return res.status(400).json({ success: false, message: 'Excel file is empty' });

    const seenEmails = new Set();

    data.forEach((row, i) => {
      const rowNum = i + 2;
      const { 'First Name': firstName, 'Last Name': lastName, 'Email': email, 'Phone Number': phone, 'PAN Number': pan } = row;
      const phoneStr = String(phone || '');

      if (!firstName || !lastName || !email || !phoneStr || !pan) {
        errors.push({ row: rowNum, error: 'Missing required field(s)' });
      } else if (!emailRegex.test(email)) {
        errors.push({ row: rowNum, field: 'Email', error: 'Invalid email format' });
      } else if (!/^\d{10}$/.test(phoneStr)) {
        errors.push({ row: rowNum, field: 'Phone Number', error: 'Phone must be 10 digits' });
      } else if (!validatePAN(pan)) {
        errors.push({ row: rowNum, field: 'PAN Number', error: 'Invalid PAN format' });
      } else if (seenEmails.has(email)) {
        errors.push({ row: rowNum, field: 'Email', error: 'Duplicate email in file' });
      } else {
        seenEmails.add(email);
        validUsers.push({ firstName, lastName, email, phoneNumber: phoneStr, panNumber: pan });
      }
    });

    if (errors.length) return res.status(400).json({ success: false, message: 'Validation errors', errors });

    // Check DB for duplicates
    const dbConflicts = [];
    for (const user of validUsers) {
      const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [user.email]);
      if (rows.length) dbConflicts.push(user.email);
    }

    if (dbConflicts.length) {
      return res.status(400).json({
        success: false,
        message: 'Emails already exist',
        errors: dbConflicts.map(email => ({ field: 'Email', error: `Exists: ${email}` }))
      });
    }

    // Insert users
    await Promise.all(validUsers.map(user =>
      pool.query('INSERT INTO users (firstName, lastName, email, phoneNumber, panNumber) VALUES (?, ?, ?, ?, ?)',
        [user.firstName, user.lastName, user.email, user.phoneNumber, user.panNumber])
    ));

    res.json({ success: true, message: `Imported ${validUsers.length} users`, count: validUsers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process upload', error: error.message });
  }
});

module.exports = router;
