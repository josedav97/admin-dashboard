const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET = 'secreto123';

app.use(cors());
app.use(express.json());

// ── MIDDLEWARE ──────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// ── RUTAS PÚBLICAS ──────────────────────────────────────
let users = [];

app.get('/', (req, res) => {
  res.send('API funcionando 🚀');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const userExists = users.find(u => u.email === email);

  if (userExists) {
    return res.status(400).json({ message: 'Usuario ya existe' });
  }

  users.push({ email, password });
  res.json({ message: 'Usuario registrado' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(400).json({ message: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login exitoso', token });
});

// ── RUTAS PROTEGIDAS ────────────────────────────────────
app.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Perfil del usuario', user: req.user });
});

app.get('/dashboard', verifyToken, (req, res) => {  // 👈 ruta nueva
  res.json({ message: `Bienvenido al dashboard, ${req.user.email}` });
});

app.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});