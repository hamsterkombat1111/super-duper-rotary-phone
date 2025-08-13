// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const path = require('path');

// Настройка приложения
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к базе данных
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключено к SQLite базе данных');
    }
});

// Логирование посещений
app.post('/log-visit', (req, res) => {
    const { ip, userAgent, page } = req.body;
    
    db.run(
        'INSERT INTO visit_logs (ip, user_agent, page) VALUES (?, ?, ?)',
        [ip || req.ip, userAgent, page],
        (err) => {
            if (err) {
                console.error('Ошибка логирования:', err);
                return res.status(500).send('Ошибка логирования');
            }
            res.sendStatus(200);
        }
    );
});

// Получение списка администраторов
app.get('/api/admins', (req, res) => {
    db.all('SELECT * FROM admins ORDER BY name', [], (err, rows) => {
        if (err) {
            console.error('Ошибка получения администраторов:', err);
            return res.status(500).send('Ошибка сервера');
        }
        res.json(rows);
    });
});

// Добавление администратора
app.post('/api/admins', (req, res) => {
    const { name, username, role } = req.body;
    
    db.run(
        'INSERT INTO admins (name, username, role) VALUES (?, ?, ?)',
        [name, username, role],
        function(err) {
            if (err) {
                console.error('Ошибка добавления администратора:', err);
                return res.status(500).send('Ошибка сервера');
            }
            res.json({ id: this.lastID });
        }
    );
});

// Удаление администратора
app.delete('/api/admins/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM admins WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Ошибка удаления администратора:', err);
            return res.status(500).send('Ошибка сервера');
        }
        res.json({ changes: this.changes });
    });
});

// Получение заблокированных IP
app.get('/api/blocked-ips', (req, res) => {
    db.all('SELECT * FROM blocked_ips ORDER BY blocked_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Ошибка получения IP:', err);
            return res.status(500).send('Ошибка сервера');
        }
        res.json(rows);
    });
});

// Блокировка IP
app.post('/api/blocked-ips', (req, res) => {
    const { ip, reason } = req.body;
    
    db.run(
        'INSERT INTO blocked_ips (ip, reason) VALUES (?, ?)',
        [ip, reason],
        function(err) {
            if (err) {
                console.error('Ошибка блокировки IP:', err);
                return res.status(500).send('Ошибка сервера');
            }
            res.json({ id: this.lastID });
        }
    );
});

// Разблокировка IP
app.delete('/api/blocked-ips/:ip', (req, res) => {
    const { ip } = req.params;
    
    db.run('DELETE FROM blocked_ips WHERE ip = ?', [ip], function(err) {
        if (err) {
            console.error('Ошибка разблокировки IP:', err);
            return res.status(500).send('Ошибка сервера');
        }
        res.json({ changes: this.changes });
    });
});

// Получение логов посещений
app.get('/api/visit-logs', (req, res) => {
    db.all('SELECT * FROM visit_logs ORDER BY visited_at DESC LIMIT 100', [], (err, rows) => {
        if (err) {
            console.error('Ошибка получения логов:', err);
            return res.status(500).send('Ошибка сервера');
        }
        res.json(rows);
    });
});

// Аутентификация
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) {
                console.error('Ошибка аутентификации:', err);
                return res.status(500).send('Ошибка сервера');
            }
            
            if (row) {
                res.json({ success: true });
            } else {
                res.status(401).json({ success: false, message: 'Неверные учетные данные' });
            }
        }
    );
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});