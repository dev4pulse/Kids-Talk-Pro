// server.js
require('dotenv').config();
const path    = require('path');
const express = require('express');
const bcrypt  = require('bcrypt');
const session = require('express-session');
const pool    = require('./config/db');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple session store (for demo)
app.use(session({
  secret:  process.env.SESSION_SECRET || 'keyboard-cat',
  resave:  false,
  saveUninitialized: false,
}));

// ── SIGNUP ────────────────────────────────────────────────────────────────────
// Learner signup
app.post('/api/learners/signup', async (req, res) => {
  const { name, email, parentemail, password } = req.body;
  if (!name || !email || !password) return res.status(400).send('Missing fields');

  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      `INSERT INTO learners (name, email, parent_email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [name, email, parentemail || null, hash]
    );
    // store session
    req.session.user = { role: 'learner', email };
    // redirect to learner home
    return res.redirect('/homepage.html');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Signup failed');
  }
});

// Expert signup
app.post('/api/experts/signup', async (req, res) => {
  const { name, email, password, expertise, experience_years, bio } = req.body;
  if (!name || !email || !password) return res.status(400).send('Missing fields');

  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      `INSERT INTO experts
         (name, email, password_hash, expertise, experience_years, bio)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hash, expertise, experience_years, bio]
    );
    req.session.user = { role: 'expert', email };
    return res.redirect('/experthomepage.html');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Signup failed');
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// Learner login
app.post('/api/learners/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query(
    `SELECT password_hash FROM learners WHERE email = ?`, [email]
  );
  if (!rows.length) return res.status(401).send('Invalid credentials');

  const match = await bcrypt.compare(password, rows[0].password_hash);
  if (!match) return res.status(401).send('Invalid credentials');

  req.session.user = { role: 'learner', email };
  return res.redirect('/homepage.html');
});

// Expert login
app.post('/api/experts/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query(
    `SELECT password_hash FROM experts WHERE email = ?`, [email]
  );
  if (!rows.length) return res.status(401).send('Invalid credentials');

  const match = await bcrypt.compare(password, rows[0].password_hash);
  if (!match) return res.status(401).send('Invalid credentials');

  req.session.user = { role: 'expert', email };
  return res.redirect('/experthomepage.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
