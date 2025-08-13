require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Инициализация базы данных
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        role TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS blocked_ips (
        id SERIAL PRIMARY KEY,
        ip TEXT NOT NULL UNIQUE,
        reason TEXT,
        blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS visit_logs (
        id SERIAL PRIMARY KEY,
        ip TEXT NOT NULL,
        user_agent TEXT,
        page TEXT,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Добавляем стандартного админа
    const { rows } = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (rows.length === 0) {
      await pool.query("INSERT INTO users (username, password) VALUES ('admin', 'qwerqwer')");
    }
  } catch (err) {
    console.error('Ошибка инициализации БД:', err);
  }
}

// API для администраторов
app.get('/api/admins', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM admins ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения админов:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admins', async (req, res) => {
  const { name, username, role } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO admins (name, username, role) VALUES ($1, $2, $3) RETURNING *',
      [name, username, role || 'Модератор']
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Ошибка добавления админа:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admins/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM admins WHERE id = $1', [id]);
    res.json({ success: true, changes: rowCount });
  } catch (err) {
    console.error('Ошибка удаления админа:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API для IP
app.get('/api/blocked-ips', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM blocked_ips ORDER BY blocked_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения IP:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/blocked-ips', async (req, res) => {
  const { ip, reason } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO blocked_ips (ip, reason) VALUES ($1, $2) RETURNING *',
      [ip, reason]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Ошибка блокировки IP:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/blocked-ips/:ip', async (req, res) => {
  const { ip } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM blocked_ips WHERE ip = $1', [ip]);
    res.json({ success: true, changes: rowCount });
  } catch (err) {
    console.error('Ошибка разблокировки IP:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Логирование
app.post('/log-visit', async (req, res) => {
  const ip = req.ip.replace('::ffff:', '');
  const userAgent = req.get('User-Agent');
  const { page } = req.body;

  try {
    await pool.query(
      'INSERT INTO visit_logs (ip, user_agent, page) VALUES ($1, $2, $3)',
      [ip, userAgent, page || 'main.html']
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Ошибка логирования:', err);
    res.sendStatus(500);
  }
});

app.get('/api/visit-logs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM visit_logs ORDER BY visited_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    console.error('Ошибка получения логов:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Аутентификация
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Ошибка аутентификации:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Статические файлы
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Инициализация и запуск
initializeDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
